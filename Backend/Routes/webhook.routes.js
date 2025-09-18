const express = require('express');
const webhookLog = require('../model/webhook.model.js');
const Order = require('../model/order.model.js');
const OrderStatus = require('../model/orderStatus.model.js');


const webhookrouter = express.Router();

webhookrouter.post('/webhook', async (req, res) => {
  try {
    // 1. Log raw payload
    await webhookLog.create({ payload: req.body });

    const body = req.body;
    const info = body.order_info || {};

    // 2. parse order_id => maybe "collectId/transactionId"
    const orderIdRaw = info.order_id || '';
    const [collectIdPart, transactionId] = orderIdRaw.split('/');

    // 3. try find Order:
    let order = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(collectIdPart)) {
      order = await Order.findById(collectIdPart);
    }
    if (!order && collectIdPart) {
      order = await Order.findOne({ custom_order_id: collectIdPart });
    }

    // 4. build update payload for OrderStatus
    const update = {
      order_amount: info.order_amount,
      transaction_amount: info.transaction_amount,
      payment_mode: info.payment_mode,
      payment_details: info.payemnt_details || info.payment_details,
      bank_reference: info.bank_reference,
      payment_message: info.Payment_message || info.payment_message,
      status: info.status,
      error_message: info.error_message || null,
      payment_time: info.payment_time ? new Date(info.payment_time) : undefined
    };
    if (transactionId) update.transaction_id = transactionId;

    if (order) {
      // update existing orderStatus or create if missing
      await OrderStatus.findOneAndUpdate({ collect_id: order._id }, { $set: update }, { upsert: true });
    } else {
      // If order not found, optionally create an OrderStatus with collect_id null or log for manual review
      await OrderStatus.create(Object.assign({ collect_id: null }, update));
      console.warn('Webhook received for unknown order:', collectIdPart);
    }

    return res.status(200).json({ success: true });
  } catch (err) { 
    console.error('Error processing webhook:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
   }
});

module.exports = webhookrouter;
