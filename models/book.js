const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookSchema = new Schema({
  // REQUIRED FIELDS
  ASIN: { type: String, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  cover: { type: String, required: true },
  Publisher: { type: String, required: true },
  publication_date: { type: Date, required: true },
  language: { type: String, required: true },
  price: { type: Number },
  last_price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  short_description: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'CATEGORY' },
  sub_category: { type: Schema.Types.ObjectId, ref: 'SUB_CATEGORY' },

  // OPTIONAL FIELDS
  reviews: { type: [String] },
  average_rating: { type: Number, default: 0 },
  ratings_count: { type: Number, default: 0 },
  tags: { type: [String] },
  created_at: { type: Date, default: Date.now() },
  is_stock: { type: Boolean, default: true },
  discount: { type: Number },
  pages_count: { type: Number },
});

// SCHEMA MIDDLEWARS
bookSchema.pre(/^save/, function () {
  if (
    this.isNew ||
    this.isModified('last_price') ||
    this.isModified('discount')
  ) {
    this.price = Math.round(
      this.last_price - (this.last_price * this.discount) / 100
    );
  }
});

const BOOK = model('BOOK', bookSchema);
module.exports = BOOK;
