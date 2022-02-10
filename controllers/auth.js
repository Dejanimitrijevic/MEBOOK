const filterRequest = require('../helpers/filterRequest');
const USER = require('../models/user');
const jwt = require('jsonwebtoken');

class Authentication {
  #generateJWTToken = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_TOKEN_EXPIRES_AT,
    });
  };
  #cookieOptions = {
    maxAge: +process.env.JWT_COOKIE_EXPIRES_AT,
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  };
  constructor() {
    /// AUTHENTICATION USER REGISTER METHOD
    this.userRegister = async (req, res, next) => {
      // REGISTER USER
      await USER.create(
        filterRequest(req.body, 'firstName', 'lastName', 'email', 'password')
      );
      // GET USER
      const { email } = req.body;
      const user = await USER.findOne({ email });
      // GENERATE JWT
      const jwt_token = this.#generateJWTToken(user);
      res.cookie('jwt', jwt_token, this.#cookieOptions);
      // CONTINUE
      req.jwt = jwt_token;
      req.user = user;
      next();
    };
    /// AUTHENTICATION INITIALIZE USER ACCOUNT VERIFICATION METHOD
    this.initAccountVerification = async (req, res, next) => {
      const { id } = req.user;
      const user = await USER.findById(id);
      const { otp, token } = await user.initAccontVerification();
      // CONTINUE
      req.userId = user.id;
      req.token = token;
      req.otp = otp;
      next();
    };
    /// AUTHENTICATION USER LOGIN METHOD
    this.userLogin = async (req, res) => {
      const { user } = req;
      // GENERATE JWT
      const jwt_token = this.#generateJWTToken(user);
      // SUCCESS RESPONSE
      res.cookie('jwt', jwt_token, this.#cookieOptions);
      res.status(200).json({
        status: 'success',
        msg: 'Logged in successfully ✅',
      });
    };
    /// AUTHENTICATION  USER ACCOUNT VERIFY METHOD
    this.userAccountVerify = async (req, res, next) => {
      const { id } = req.user;
      const user = await USER.findById(id).select(
        '+account_verify_otp +account_verify_token +is_account_verified +otp_expires_in -__v'
      );
      user.is_account_verified = true;
      user.account_verify_token = undefined;
      user.account_verify_otp = undefined;
      user.otp_expires_in = undefined;
      await user.save({ validateBeforeSave: false });
      // GENERATE JWT
      const jwt_token = this.#generateJWTToken(user);
      res.cookie('jwt', jwt_token, this.#cookieOptions);
      res.status(201).json({
        status: 'success',
        msg: 'Your account verified successfully ✅',
      });
    };
    /// AUTHORIZE USER
    this.authorize = async (req, res, next) => {
      const token = req.cookies['jwt'];
      let user;
      // CHECK IF NO TOKEN
      if (!token) {
        return res.status(401).json({
          status: 'error',
          msg: 'Not logged in, try log in again',
        });
      }
      // VERIFY JWT TOKEN
      if (token) {
        try {
          const valid = jwt.verify(token, process.env.JWT_SECRET_KEY);
          if (!valid) {
            return res.status(401).json({
              status: 'error',
              msg: 'Not logged in, try log in again',
            });
          }
          if (valid) {
            const id = valid.user._id;
            user = await USER.findById(id).select('+password_changed_at');
            if (!user) {
              return res.status(401).json({
                status: 'error',
                msg: 'Not logged in, try log in again',
              });
            }
            if (user) {
              if (
                user.password_changed_at &&
                Date.parse(user.password_changed_at) > valid.iat * 1000
              ) {
                return res.status(401).json({
                  status: 'error',
                  msg: 'Password changed after session is issued, try login again',
                });
              }
            }
          }
        } catch (error) {
          return res.status(401).json({
            status: 'error',
            msg: 'Not logged in, try log in again',
          });
        }
      }
      user.password_changed_at = undefined;
      req.user = user;
      next();
    };
    /// AUTHORIZE TO ONLY EMAIL VERIFIED USERS
    this.restrictToVerifiedUser = (req, res, next) => {
      if (!req.user.is_account_verified) {
        return res.status(402).json({
          status: 'error',
          msg: 'You have to verify your email address to perfom this action',
        });
      }
      next();
    };
    /// AUTHENTICATION RE_INITIALIZE USER ACCOUNT VERIFICATION METHOD
    this.reAccountVerification = async (req, res, next) => {
      const { id } = req.user;
      const user = await USER.findById(id);
      const { otp, token } = await user.initAccontVerification();
      // CONTINUE
      req.userId = user.id;
      req.token = token;
      req.otp = otp;
      next();
    };
    /// AUTHENTICATION  USER FORGOT PASSWORD
    this.userForgotPassword = async (req, res, next) => {
      const { id } = req.user;
      const user = await USER.findById(id);
      const token = await user.initForgotPassword();
      // CONTINUE
      req.token = token;
      req.user = user;
      req.userId = user.id;
      next();
    };
    /// AUTHENTICATION  USER RESET PASSWORD
    this.userResetPassword = async (req, res, next) => {
      const { id } = req.user;
      const user = await USER.findById(id).select(
        '+password +reset_password_token'
      );
      user.password = req.password;
      user.reset_password_token = undefined;
      user.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        msg: 'Your password has been reset successfully ✅',
      });
    };
    /// AUTHENTICATION USER LOGOUT METHOD
    this.userLogout = async (req, res, next) => {
      res.clearCookie('jwt', { ...this.#cookieOptions, maxAge: 0 });
      res.status(200).json({
        status: 'success',
        msg: 'Logged out successfully ✅',
      });
    };
    /// AUTHENTICATION GET LOGGED IN USER DATA
    this.getUserData = async (req, res) => {
      const { id } = req.user;
      const user = await USER.findById(id)
        .select('+cart')
        .select('+avatar')
        .select('+wishlist')
        .select('+orders')
        .populate('wishlist')
        .populate('cart.items.item');
      res.status(200).json({
        data: {
          user,
        },
      });
    };
  }
}

module.exports = new Authentication();
