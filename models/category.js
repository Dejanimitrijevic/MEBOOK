const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const slugify = require('slugify');

const categorySchema = new Schema({
  title: { type: String, required: true, unique: true },
  slug: String,
  sub_categories: [{ type: Schema.Types.ObjectId, ref: 'SUB_CATEGORY' }],
});

// SCHEMA MIDDLEWARS
categorySchema.pre(/^save/, function () {
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title);
  }
});

const CATEGORY = model('CATEGORY', categorySchema);
module.exports = CATEGORY;
