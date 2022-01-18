const filterRequest = require('../helpers/filterRequest');
const USER = require('../models/user');
const jwt = require('jsonwebtoken');

class Authentication {
  constructor() {
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
        maxAge: 6 * 60 * 60 * 1000, // would expire after 6 hours
        httpOnly: false,
        signed: false,
      });
      req.user = user;
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
        maxAge: 6 * 60 * 60 * 1000, // would expire after 6 hours
        httpOnly: false,
        signed: false,
      });
      // SUCCESS RESPONSE
      res.status(200).json({
        status: 'success',
        msg: 'logged in successfully ✅.',
      });
    };
    /// AUTHENTICATION INITIALIZE USER ACCOUNT VERIFICATION METHOD
    this.initAccountVerification = async (req, res, next) => {
      const user = await USER.findOne(req.user);
      const { otp, token } = await user.initAccontVerification();
      // SUCCESS RESPONSE
      res.status(201).json({
        status: 'success',
        msg: 'account created successfully ✅.',
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
        msg: 'your account has been verified successfully ✅.',
      });
    };
    /// AUTHENTICATION IS USER LOGGED IN
    this.isUserLoggedIn = async (req, res, next) => {
      const token = req.cookies['jwt'];
      // CHECK IF NO TOKEN
      if (!token) {
        return res.status(401).json({
          status: 'success',
          msg: 'not logged in, try log in again.',
        });
      }
      // VERIFY JWT TOKEN
      if (token) {
        try {
          const valid = jwt.verify(token, process.env.JWT_SECRET_KEY);
          if (!valid) {
            return res.status(401).json({
              status: 'success',
              msg: 'not logged in, try log in again.',
            });
          }
        } catch (error) {
          return res.status(401).json({
            status: 'success',
            msg: 'not logged in, try log in again.',
          });
        }
      }
      next();
    };
  }
}

module.exports = new Authentication();
