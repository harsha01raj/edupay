// src/models/OrderStatus.js
const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema(
  {
    collect_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      index: true,
    },
    order_amount: Number,
    transaction_amount: Number,
    payment_mode: String,
    payment_details: { type: mongoose.Schema.Types.Mixed, default: null },
    bank_reference: String,
    payment_message: String,
    status: String,
    error_message: String,
    payment_time: Date,
    transaction_id: { type: String, index: true },

    collect_request_id: { type: String, index: true },
    payment_url: String,
    gateway_sign: String,
  },
  { timestamps: true }
);

const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);
module.exports = OrderStatus;

