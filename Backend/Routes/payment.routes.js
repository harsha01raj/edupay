// src/controllers/payment.controller.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const Order = require('../model/order.model.js');
const OrderStatus = require('../model/orderStatus.model.js');
const { auth } = require('../middleware/auth.middleware'); 

const paymentRouter = express.Router();

// helper to sign payload for create-collect-request
function makeCreateSign({ school_id, amount, callback_url }) {
  if (!process.env.PG_SECRET) throw new Error('PG_SECRET not configured');
  const payload = { school_id, amount: String(amount), callback_url };
  return jwt.sign(payload, process.env.PG_SECRET, { algorithm: 'HS256' });
}

// helper to sign payload for status check
function makeStatusSign({ school_id, collect_request_id }) {
  if (!process.env.PG_SECRET) throw new Error('PG_SECRET not configured');
  return jwt.sign({ school_id, collect_request_id }, process.env.PG_SECRET, { algorithm: 'HS256' });
}

/**
 * POST /create-payment
 * Body: { school_id, order_amount, student_info, custom_order_id?, gateway_name? }
 */
paymentRouter.post(
  '/create-payment',
  auth,
  body('school_id').notEmpty().withMessage('school_id is required'),
  body('order_amount').notEmpty().withMessage('order_amount is required').bail().isNumeric().withMessage('order_amount must be numeric'),
  // student_info custom validator
  body('student_info').custom((v) => {
    if (!v || typeof v !== 'object') throw new Error('student_info must be an object');
    if (!v.name || !v.id) throw new Error('student_info.name and student_info.id are required');
    return true;
  }),
  async (req, res) => {
    // validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { school_id, custom_order_id, order_amount, student_info, gateway_name } = req.body;

    // basic env validation
    if (!process.env.PAYMENT_API_KEY) {
      console.error('PAYMENT_API_KEY missing');
      return res.status(500).json({ message: 'Server misconfigured' });
    }
    if (!process.env.SCHOOL_ID && !school_id) {
      return res.status(400).json({ message: 'school_id missing' });
    }
    if (!process.env.APP_BASE_URL) {
      console.warn('APP_BASE_URL not configured — callback URL may be invalid');
    }

    // ensure positive amount
    const amountNum = Number(order_amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'order_amount must be a positive number' });
    }

    try {
      // 1) create Order
      const order = await Order.create({
        school_id,
        trustee_id: req.user?.sub || null,
        student_info,
        gateway_name,
        custom_order_id: custom_order_id || `ORD-${Date.now()}`
      });

      // 2) create OrderStatus pending
      const os = await OrderStatus.create({
        collect_id: order._id,
        order_amount: amountNum,
        status: 'pending'
      });

      // 3) Prepare sign and request body according to Vanilla API
      const callback_url = `${process.env.APP_BASE_URL || ''}/payment-callback`;
      const sign = makeCreateSign({ school_id: process.env.SCHOOL_ID || school_id, amount: String(amountNum), callback_url });

      const bodyPayload = {
        school_id: process.env.SCHOOL_ID || school_id,
        amount: String(amountNum),
        callback_url,
        sign
      };

      // 4) Call the gateway
      let resp;
      try {
        resp = await axios.post('https://dev-vanilla.edviron.com/erp/create-collect-request', bodyPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
          },
          timeout: 15000
        });
      } catch (axiosErr) {
        // log and update order status
        console.error('Gateway call failed:', axiosErr.response?.data || axiosErr.message);
        await OrderStatus.findByIdAndUpdate(os._id, { status: 'failed', error_message: String(axiosErr.message) });
        return res.status(502).json({ message: 'Payment gateway error', details: axiosErr.response?.data || axiosErr.message });
      }

      const data = resp.data || {};

      // 5) Save returned gateway fields into OrderStatus
      await OrderStatus.findByIdAndUpdate(os._id, {
        status: 'created',
        collect_request_id: data.collect_request_id,
        payment_url: data.Collect_request_url || data.collect_request_url,
        gateway_sign: data.sign
      });

      // 6) Return created info (or redirect if front-end expects that)
      return res.status(201).json({
        message: 'Collect created',
        collect_request_id: data.collect_request_id,
        payment_url: data.Collect_request_url || data.collect_request_url
      });

    } catch (err) {
      console.error('create-payment error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * GET /payment-check/:collect_request_id
 * Checks payment status at gateway and updates OrderStatus.
 */
paymentRouter.get('/payment-check/:collect_request_id', auth, async (req, res) => {
  try {
    const collect_request_id = req.params.collect_request_id;
    const school_id = process.env.SCHOOL_ID;
    if (!school_id) return res.status(500).json({ message: 'SCHOOL_ID not configured' });

    // create sign for GET request
    const sign = makeStatusSign({ school_id, collect_request_id });

    const url = `https://dev-vanilla.edviron.com/erp/collect-request/${encodeURIComponent(collect_request_id)}?school_id=${encodeURIComponent(school_id)}&sign=${encodeURIComponent(sign)}`;

    let resp;
    try {
      resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
        },
        timeout: 15000
      });
    } catch (axiosErr) {
      console.error('payment-check axios error', axiosErr.response?.data || axiosErr.message);
      return res.status(502).json({ message: 'Payment gateway error', details: axiosErr.response?.data || axiosErr.message });
    }

    const data = resp.data || {}; // { status: 'SUCCESS'|'PENDING'|'FAILED', amount, details, jwt }

    // find OrderStatus by collect_request_id
    const os = await OrderStatus.findOne({ collect_request_id: collect_request_id });
    if (!os) {
      // don't throw — just inform caller
      return res.status(404).json({ message: 'OrderStatus not found for collect_request_id', gateway: data });
    }

    const update = {};
    if (String(data.status).toUpperCase() === 'SUCCESS') {
      update.status = 'success';
      update.transaction_amount = data.amount ?? os.order_amount;
      update.payment_time = new Date();
    } else if (String(data.status).toUpperCase() === 'FAILED') {
      update.status = 'failed';
    } else {
      update.status = 'pending';
    }

    await OrderStatus.findByIdAndUpdate(os._id, update);

    return res.json({ gateway: data, updated: update });
  } catch (err) {
    console.error('payment-check error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = paymentRouter;
