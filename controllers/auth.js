const filterRequest = require('../helpers/filterRequest');
const USER = require('../models/user');
const jwt = require('jsonwebtoken');

class Authentication {
  constructor() {
    /// AUTHORIZE USER
    this.authorize = async (req, res, next) => {
      let user;
      const token = req.cookies['jwt'];
      // CHECK IF NO TOKEN
      if (!token) {
        return res.status(401).json({
          status: 'error',
          msg: 'not logged in, try log in again.',
        });
      }
      // VERIFY JWT TOKEN
      if (token) {
        try {
          const valid = jwt.verify(token, process.env.JWT_SECRET_KEY);
          if (!valid) {
            return res.status(401).json({
              status: 'error',
              msg: 'not logged in, try log in again.',
            });
          }
          if (valid) {
            user = await USER.findById(valid.user._id).select(
              '+password_changed_at'
            );
            if (!user) {
              return res.status(401).json({
                status: 'error',
                msg: 'not logged in, try log in again.',
              });
            }
            if (user) {
              if (Date.parse(user.password_changed_at) > valid.iat * 1000) {
                return res.status(401).json({
                  status: 'error',
                  msg: 'password changed after session is issued, try login again.',
                });
              }
            }
          }
        } catch (error) {
          return res.status(401).json({
            status: 'error',
            msg: 'not logged in, try log in again.',
          });
        }
      }
      user.password_changed_at = undefined;
      req.user = user;
      next();
    };
    /// AUTHENTICATION USER REGISTER METHOD
    this.userRegister = async (req, res, next) => {
      // REGISTER USER
      await USER.create(
        filterRequest(req.body, 'firstName', 'lastName', 'password', 'email')
      );
      // GET USER
      const { email } = req.body;
      const user = await USER.findOne({ email });
      // GENERATE JWT
      const jwt_token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_AT,
      });
      // SET JWT COOKIE
      res.cookie('jwt', jwt_token, {
        maxAge: 3 * 24 * 60 * 60 * 1000, // would expire after 3 days
        httpOnly: false,
        signed: false,
      });
      req.user = user;
      next();
    };
    /// AUTHENTICATION INITIALIZE USER ACCOUNT VERIFICATION METHOD
    this.initAccountVerification = async (req, res, next) => {
      const user = await USER.findOne(req.user);
      const { otp, token } = await user.initAccontVerification();
      // CONTINUE
      req.userId = user.id;
      req.token = token;
      req.otp = otp;
      next();
    };
    /// AUTHENTICATION USER LOGIN METHOD
    this.userLogin = async (req, res, next) => {
      const { user } = req;

      // GENERATE JWT
      const jwt_token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_AT,
      });
      // SET JWT COOKIE
      res.cookie('jwt', jwt_token, {
        maxAge: 3 * 24 * 60 * 60 * 1000, // would expire after 3 days
        httpOnly: false,
        signed: false,
      });
      // SUCCESS RESPONSE
      res.status(200).json({
        status: 'success',
        msg: 'logged in successfully ✅.',
      });
    };

    /// AUTHENTICATION RE_INITIALIZE USER ACCOUNT VERIFICATION METHOD
    this.reAccountVerification = async (req, res, next) => {
      const user = await USER.findOne(req.user);
      const { otp, token } = await user.initAccontVerification();
      // SUCCESS RESPONSE
      res.status(201).json({
        status: 'success',
        msg: 'your account verification re-issued successfully ✅.',
        data: {
          userID: user._id,
          otp,
          token,
        },
      });
      next();
    };
    /// AUTHENTICATION  USER ACCOUNT VERIFY METHOD
    this.userAccountVerify = async (req, res, next) => {
      const user = await USER.findOne(req.user).select(
        '+account_verify_otp +account_verify_token +is_account_verified'
      );
      user.is_account_verified = true;
      user.account_verify_token = undefined;
      user.account_verify_otp = undefined;
      user.save({ validateBeforeSave: false });
      return res.status(200).json({
        status: 'success',
        msg: 'your account verified successfully ✅.',
      });
    };
    /// AUTHENTICATION  USER FORGOT PASSWORD
    this.userForgotPassword = async (req, res, next) => {
      const user = await USER.findOne(req.user);
      const token = await user.initForgotPassword();
      // CONTINUE
      req.token = token;
      req.user = user;
      req.userId = user.id;
      next();
    };
    /// AUTHENTICATION  USER RESET PASSWORD
    this.userResetPassword = async (req, res, next) => {
      const user = await USER.findOne(req.user).select(
        '+password +reset_password_token'
      );
      user.password = req.password;
      user.reset_password_token = undefined;
      user.save({ validateBeforeSave: false });

      return res.status(200).json({
        status: 'success',
        msg: 'your password has been reset successfully ✅.',
      });
    };
    /// AUTHENTICATION USER LOGOUT METHOD
    this.userLogout = async (req, res, next) => {
      res.cookie('jwt', undefined);
      res.status(200).json({
        status: 'success',
        msg: 'logged out successfully ✅.',
      });
    };
  }
}

module.exports = new Authentication();
