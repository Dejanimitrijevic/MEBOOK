const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');
const randomize = require('randomatic');
const crypto = require('crypto');

const userSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true, select: false },
  account_created_at: { type: Date, default: Date.now(), select: false },
  password_changed_at: { type: Date, default: Date.now(), select: false },

  account_verify_otp: { type: String, select: false },
  account_verify_token: { type: String, select: false },
  is_account_verified: { type: Boolean, default: false, select: false },
});

// USER SCHEMA MIDDLEWARS
userSchema.pre(/^save/, async function () {
  if (this.isModified('password') || this.isNew) {
    const SALT = +process.env.SALT;
    this.password = await bcrypt.hash(this.password, SALT);
  }
});

// USER SCHEMA METHODS
userSchema.methods.initAccontVerification = async function () {
  const SALT = +process.env.SALT;
  const otp = randomize('0', 6);
  const token = crypto.randomBytes(32).toString('hex');
  this.account_verify_otp = await bcrypt.hash(otp, SALT);
  this.account_verify_token = await bcrypt.hash(token, SALT);
  this.save({ validateBeforeSave: false });
  return { otp, token };
};

const USER = model('USER', userSchema);
module.exports = USER;
