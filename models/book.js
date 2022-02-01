const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const slugify = require('slugify');

const bookSchema = new Schema({
  // REQUIRED FIELDS
  i: { type: Number, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  cover: { type: String, required: true },
  Publisher: { type: String, required: true },
  publication_date: { type: Date, required: true },
  language: { type: String, required: true },
  last_price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  short_description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'CATEGORY', required: true },
  sub_category: {
    type: Schema.Types.ObjectId,
    ref: 'SUB_CATEGORY',
    required: true,
  },
  pages_count: { type: Number, required: true },

  // OPTIONAL FIELDS
  slug: { type: String },
  price: { type: Number },
  reviews: { type: [String] },
  average_rating: { type: Number, default: 0 },
  ratings_count: { type: Number, default: 0 },
  tags: { type: [String] },
  created_at: { type: Date, default: Date.now() },
  is_stock: { type: Boolean, default: true },
  discount: { type: Number },
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

bookSchema.pre(/^save/, function () {
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title);
  }
});

const BOOK = model('BOOK', bookSchema);
module.exports = BOOK;
