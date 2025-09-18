const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  school_id: { type: String, required: true, index: true },
  trustee_id: { type: String },
  student_info: {
    name: { type: String },
    id: { type: String },
    email: { type: String }
  },
  gateway_name: { type: String },
  custom_order_id: { type: String, index: true }, // merchant id
}, { timestamps: true });


const Order = mongoose.model('Order', orderSchema);
module.exports = Order


