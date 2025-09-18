const express = require('express');
const OrderStatus = require('../model/orderStatus.model.js');
const transactionRouter = express.Router();
const { auth } = require('../middleware/auth.middleware.js');
const Order = require('../model/order.model.js');

// GET /transactions?page=1&limit=20&sort=payment_time&order=desc
transactionRouter.get('/transactions', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '20'));
    const sortField = req.query.sort || 'payment_time';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $lookup: { from: 'orders', localField: 'collect_id', foreignField: '_id', as: 'order' }},
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
      { $project: {
          collect_id: '$collect_id',
          school_id: '$order.school_id',
          gateway: '$order.gateway_name',
          order_amount: '$order_amount',
          transaction_amount: '$transaction_amount',
          status: '$status',
          custom_order_id: '$order.custom_order_id',
          payment_time: '$payment_time'
      }},
      { $sort: { [sortField]: sortOrder }},
      { $skip: skip },
      { $limit: limit }
    ];

    const results = await OrderStatus.aggregate(pipeline);
    // simple total count (without filters)
    const total = await OrderStatus.countDocuments();

    res.json({ data: results, meta: { total, page, limit } });
  } catch (err) { next(err); }
});

// GET /transactions/school/:schoolId
transactionRouter.get('/transactions/school/:schoolId', auth, async (req, res, next) => {
  try {
    const schoolId = req.params.schoolId;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '20'));
    const skip = (page - 1) * limit;

    const pipeline = [
      { $lookup: { from: 'orders', localField: 'collect_id', foreignField: '_id', as: 'order' }},
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
      { $match: { 'order.school_id': schoolId }},
      { $project: {
          collect_id: '$collect_id',
          school_id: '$order.school_id',
          gateway: '$order.gateway_name',
          order_amount: '$order_amount',
          transaction_amount: '$transaction_amount',
          status: '$status',
          custom_order_id: '$order.custom_order_id'
      }},
      { $skip: skip },
      { $limit: limit }
    ];

    const results = await OrderStatus.aggregate(pipeline);
    res.json({ data: results, meta: { page, limit } });
  } catch (err) { next(err); }
});

// GET /transaction-status/:custom_order_id
transactionRouter.get('/transaction-status/:custom_order_id', auth, async (req, res, next) => {
  try {
    const customId = req.params.custom_order_id;
    

    const order = await Order.findOne({ custom_order_id: customId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const status = await OrderStatus.findOne({ collect_id: order._id }).sort({ payment_time: -1, createdAt: -1 });
    return res.json({ order: order, status: status || null });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });

   }
});

module.exports = transactionRouter;
