const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  payload: { type: mongoose.Schema.Types.Mixed },
  receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const webhook = mongoose.model('WebhookLog', webhookLogSchema);

module.exports = webhook;