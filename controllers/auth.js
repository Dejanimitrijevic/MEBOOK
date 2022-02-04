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
      res.status(201).json({
        status: 'success',
        msg: 'logged in successfully ✅.',
        data: {
          user,
        },
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
        msg: 'your account verified successfully ✅.',
        data: {
          user,
        },
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
            const id = valid.user._id;
            user = await USER.findById(id).select('+password_changed_at');
            if (!user) {
              return res.status(401).json({
                status: 'error',
                msg: 'not logged in, try log in again.',
              });
            }
            if (user) {
              // if (
              //   user.password_changed_at &&
              //   Date.parse(user.password_changed_at) > valid.iat * 1000
              // ) {
              //   return res.status(401).json({
              //     status: 'error',
              //     msg: 'password changed after session is issued, try login again.',
              //   });
              // }
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
        msg: 'your password has been reset successfully ✅.',
      });
    };
    /// AUTHENTICATION USER LOGOUT METHOD
    this.userLogout = async (req, res, next) => {
      res.clearCookie('jwt', { ...this.#cookieOptions, maxAge: 0 });
      res.status(200).json({
        status: 'success',
        msg: 'logged out successfully ✅.',
      });
    };
  }
}

module.exports = new Authentication();
