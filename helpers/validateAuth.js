const validator = require('validator');
const isDataMissed = require('../helpers/checkRequestData');
const USER = require('../models/user');
const bcrypt = require('bcryptjs');

class AuthValidate {
  constructor() {
    /// VALIDATE USER REGISTER PROCESS
    this.validateRegister = async (req, res, next) => {
      // CHECK FOR NEEDED DATA
      if (
        isDataMissed(req.body, 'firstName', 'lastName', 'email', 'password')
      ) {
        return res.status(400).json({
          status: 'error',
          msg: 'please enter the required fields to register (email, name and password)',
        });
      }
      // CHECK IF USER IS ALREADY REGISTERED
      if (await USER.findOne({ email: req.body.email })) {
        return res.status(400).json({
          status: 'error',
          msg: 'the entered email address is already registered.',
        });
      }
      for (const value in req.body) {
        // VALIDATE USER EMAIL ADDRESS
        if (value.includes('email')) {
          if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({
              status: 'error',
              msg: 'please enter a valid email address.',
            });
          }
        } else {
          // VALIDATE USER PASSWORDS
          if (value.includes('password') || value.includes('Password')) {
            if (
              !validator.isStrongPassword(req.body[value], { minSymbols: 0 })
            ) {
              return res.status(400).json({
                status: 'error',
                msg: 'your password must be at least 8 characters with uppercase and numbers',
              });
            }
          } else {
            // VALIDATE USER NAME (NAME WITHOUT NUMBERS)
            if (value.includes('name') || value.includes('Name')) {
              if (
                !validator.isAlpha(req.body[value], 'en-US', { ignore: ' ' })
              ) {
                return res.status(400).json({
                  status: 'error',
                  msg: 'user name can contains only letters (a-z)(A-Z)',
                });
              }
            }
          }
        }
      }
      next();
    };
    /// VALIDATE USER LOGIN PROCESS
    this.validateLogin = async (req, res, next) => {
      // CHECK FOR NEEDED DATA
      if (isDataMissed(req.body, 'email', 'password')) {
        return res.status(400).json({
          status: 'error',
          msg: 'please enter the required fields to login (email and password)',
        });
      }
      // CHECK IF USER IS EXIST AND COMPARE PASSWORDS
      const user = await USER.findOne({ email: req.body.email }).select(
        '+password'
      );
      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).json({
          status: 'error',
          msg: 'incorrect password or email address.',
        });
      }
      user.password = undefined;
      req.user = user;
      next();
    };
    /// VALIDATE USER ACCOUNT VERIFICATION PROCESS
    this.validateVerifyAccount = async (req, res, next) => {
      const { userID, token } = req.params;
      const { otp } = req.body;
      try {
        // GET USER BY ID IN REQ PARAMS
        const user = await USER.findById(userID).select(
          '+account_verify_otp +account_verify_token +is_account_verified +otp_expires_in'
        );
        // IF NO USER EXIST WITH THIS ID
        if (!user) {
          return res.status(400).json({
            status: 'error',
            msg: 'invalid or expired account verification token, try request again.',
          });
        }
        // IF TOKENS ARE NOT MATCHED (INVALID OR EXPIRED)
        if (!(await bcrypt.compare(token, user.account_verify_token))) {
          return res.status(400).json({
            status: 'error',
            msg: 'invalid or expired account verification token, try request again.',
          });
        }
        // CHECK IF TOKEN IS STILL VALID
        if (Date.parse(user.otp_expires_in) < Date.now()) {
          return res.status(401).json({
            status: 'error',
            msg: 'your account verification token is expired, try request again.',
          });
        }
        // CHECK IF ACCOUNT IS ALREADY VERIFIED
        if (user && user.is_account_verified) {
          return res.status(400).json({
            status: 'error',
            msg: 'your account is already verified.',
          });
        }
        if (isDataMissed(req.body, 'otp')) {
          return res.status(400).json({
            status: 'error',
            msg: 'please enter your account verification otp.',
          });
        }
        if (!validator.isNumeric(otp) || otp.length !== 6) {
          return res.status(400).json({
            status: 'error',
            msg: 'otp code must be numeric (6 digits) without spaces.',
          });
        }
        // CHECK IF OTP IS CORRECT
        if (!(await bcrypt.compare(otp, user.account_verify_otp))) {
          return res.status(400).json({
            status: 'error',
            msg: 'incorrect otp code.',
          });
        }
        // ATTACH DATA AND CONTINUE
        req.user = user;
        next();
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          msg: 'invalid or expired account verification token, try request again.',
        });
      }
    };
    /// VALIDATE USER ACCOUNT VERIFICATION PROCESS (CLIENT_SIDE)
    this.validateVerifyAccountClient = async (req, res, next) => {
      const { userID, token } = req.params;
      try {
        // GET USER BY ID IN REQ PARAMS
        let user = await USER.findById(userID).select(
          '+account_verify_otp +account_verify_token +is_account_verified'
        );
        // IF NO USER EXIST WITH THIS ID
        if (!user) {
          return res.status(403).json({
            status: 'error',
            msg: 'invalid or expired account verification token, try request again.',
          });
        }
        // IF TOKENS IN NOT MATCHED (INVALID OR EXPIRED)
        if (!(await bcrypt.compare(token, user.account_verify_token))) {
          return res.status(403).json({
            status: 'error',
            msg: 'invalid or expired account verification token, try request again.',
          });
        }
        if (user && user.is_account_verified) {
          return res.status(403).json({
            status: 'error',
            msg: 'your account is already verified.',
          });
        }
        // GET USER
        user = await USER.findById(userID);
        return res.status(200).json({
          user,
        });
      } catch (error) {
        return res.status(403).json({
          status: 'error',
          msg: 'invalid or expired account verification token, try request again.',
        });
      }
    };
    /// VALIDATE USER ACCOUNT RE_VERIFICATION PROCESS
    this.validateReVerify = async (req, res, next) => {
      const user = await USER.findOne(req.user).select('+is_account_verified');
      if (user && user.is_account_verified) {
        return res.status(400).json({
          status: 'error',
          msg: 'your account is already verified.',
        });
      }
      next();
    };
    /// VALIDATE ACCOUNT FORGOT PASSWORD
    this.validateForgotPassword = async (req, res, next) => {
      const { email } = req.body;
      const user = await USER.findOne({ email });
      if (!user) {
        return res.status(400).json({
          status: 'error',
          msg: 'incorrect email address.',
        });
      }
      req.user = user;
      next();
    };
    /// VALIDATE ACCOUNT RESET PASSWORD
    this.validateResetPassword = async (req, res, next) => {
      const { id, token } = req.params;
      try {
        const user = await USER.findById(id).select(
          '+reset_password_token +password +reset_token_expires_in'
        );
        if (!user) {
          return res.status(400).json({
            status: 'error',
            msg: 'invalid or expired reset password token, try request again.',
          });
        }
        if (user) {
          if (!(await bcrypt.compare(token, user.reset_password_token))) {
            return res.status(400).json({
              status: 'error',
              msg: 'invalid or expired reset password token, try request again.',
            });
          } else {
            // CHECK IF TOKEN IS STILL VALID
            if (Date.parse(user.reset_token_expires_in) < Date.now()) {
              return res.status(400).json({
                status: 'error',
                msg: 'your password reset token is expired, try request again.',
              });
            }
            // CHECK FOR NEEDED DATA
            if (
              isDataMissed(req.body, 'newPassword', 'newPasswordConfirmation')
            ) {
              return res.status(400).json({
                status: 'error',
                msg: 'please enter the required fields to reset password.',
              });
            }
            // CHECK IF PASSWORD AND CONFIRMATION ARE NOT THE SAME
            const { newPassword, newPasswordConfirmation } = req.body;
            if (!validator.isStrongPassword(newPassword, { minSymbols: 0 })) {
              return res.status(400).json({
                status: 'error',
                msg: 'your password must be at least 8 characters with uppercase and numbers',
              });
            }
            if (newPassword !== newPasswordConfirmation) {
              return res.status(400).json({
                status: 'error',
                msg: 'password and password confirmation are not the same!',
              });
            }
            req.user = user;
            req.password = newPassword || newPasswordConfirmation;
          }
        }
        next();
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          msg: 'invalid or expired reset password token, try request again.',
        });
      }
    };
    /// VALIDATE ACCOUNT RESET PASSWORD (CLIENT_SIDE)
    this.validateResetPassClient = async (req, res, next) => {
      const { id, token } = req.params;
      try {
        const user = await USER.findById(id).select(
          '+reset_password_token +reset_token_expires_in'
        );
        if (!user) {
          return res.status(400).json({
            status: 'error',
            msg: 'invalid or expired reset password token, try request again.',
          });
        }
        if (user) {
          if (!(await bcrypt.compare(token, user.reset_password_token))) {
            return res.status(400).json({
              status: 'error',
              msg: 'invalid or expired reset password token, try request again.',
            });
          }
        }
        // CHECK IF TOKEN IS STILL VALID
        if (Date.parse(user.reset_token_expires_in) < Date.now()) {
          return res.status(400).json({
            status: 'error',
            msg: 'your password reset token is expired, try request again.',
          });
        }
        return res.status(200).json({
          status: 'success',
          msg: 'valid token',
          user,
        });
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          msg: 'invalid or expired reset password token, try request again.',
        });
      }
    };
  }
}

module.exports = new AuthValidate();
