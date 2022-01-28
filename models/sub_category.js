const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const slugify = require('slugify');

const sub_categorySchema = new Schema({
  title: { type: String, required: true, unique: true },
  slug: { type: String },
});

// SCHEMA MIDDLEWARS
sub_categorySchema.pre(/^save/, function () {
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title);
  }
});

const SUB_CATEGORY = model('SUB_CATEGORY', sub_categorySchema);
module.exports = SUB_CATEGORY;
