const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');
const randomize = require('randomatic');
const crypto = require('crypto');

const userSchema = new Schema({
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'owner'],
    select: false,
  },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },

  account_created_at: { type: Date, default: Date.now(), select: false },
  password_changed_at: { type: Date, default: Date.now(), select: false },

  account_verify_otp: { type: String, select: false },
  otp_expires_in: { type: Date, select: false },
  account_verify_token: { type: String, select: false },
  is_account_verified: { type: Boolean, default: false },

  reset_password_token: { type: String, select: false },
  reset_token_expires_in: { type: Date, select: false },
});

// USER SCHEMA MIDDLEWARS
userSchema.pre(/^save/, async function () {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, +process.env.BCRYPT_SALT);
  }
  if (!this.isNew) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(
        this.password,
        +process.env.BCRYPT_SALT
      );
      this.password_changed_at = Date.now();
    }
  }
});

// USER SCHEMA METHODS
userSchema.methods.initAccontVerification = async function () {
  const SALT = +process.env.BCRYPT_SALT;
  const otp = randomize('0', 6);
  const token = crypto.randomBytes(32).toString('hex');
  this.otp_expires_in = Date.now() + +process.env.OTP_EXPIRES_IN;
  this.account_verify_otp = await bcrypt.hash(otp, SALT);
  this.account_verify_token = await bcrypt.hash(token, SALT);
  this.save({ validateBeforeSave: false });
  return { otp, token };
};

userSchema.methods.initForgotPassword = async function () {
  const SALT = +process.env.BCRYPT_SALT;
  const token = crypto.randomBytes(64).toString('hex');
  this.reset_token_expires_in =
    Date.now() + +process.env.RESET_PASS_TOKEN_EXPIRES_IN;
  this.reset_password_token = await bcrypt.hash(token, SALT);
  this.save({ validateBeforeSave: false });
  return token;
};

const USER = model('USER', userSchema);
module.exports = USER;
