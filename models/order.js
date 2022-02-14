const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'USER', required: true },
  billing_details: { type: {}, required: true },
  items: { type: [Schema.Types.ObjectId], ref: 'BOOK', required: true },
  quantity: { type: Number, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

const ORDER = model('ORDER', orderSchema);
module.exports = ORDER;
