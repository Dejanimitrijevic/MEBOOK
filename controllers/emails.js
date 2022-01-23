const sendEmail = require('../utils/sendEmail');

class ControlEmails {
  constructor() {
    /// ACCOUNT VERIFICATION OTP EMAIL
    this.sendAccVerification = async (req, res) => {
      const { user, userId, token, otp } = req;
      // SEND EMAIL
      sendEmail(user.email, 'otp', { otp });
      // SUCCESS RESPONSE
      res.status(201).json({
        status: 'success',
        msg: 'account created successfully ✅, Check your email for otp code.',
        data: {
          userId,
          token,
        },
      });
    };
    /// SEND REVERIFICATION OTP
    this.sendNewOtp = async (req, res) => {
      const { user, userId, token, otp } = req;
      // SEND EMAIL
      sendEmail(user.email, 'otp', { otp });
      // SUCCESS RESPONSE
      res.status(201).json({
        status: 'success',
        select: true,
        msg: 'your account verification re-issued successfully ✅, Check your email for new OTP code.',
        user,
        data: {
          userId: user._id,
          token,
        },
      });
    };
    /// ACCOUNT USER FORGOT PASSWORD LINK EMAIL
    this.sendForgotPassword = async (req, res, next) => {
      const { token, userId, user } = req;
      let HOST;
      if (process.env.NODE_ENV === 'development') {
        HOST = process.env.LOCALHOST;
      }
      if (process.env.NODE_ENV === 'production') {
        HOST = process.env.DOMAIN;
      }
      //GENERATE URL
      const URL = `${HOST}/reset-password/${userId}/${token}`;
      // SEND EMAIL
      sendEmail(user.email, 'forgot_password', { URL });
      res.status(201).json({
        status: 'success',
        msg: 'reset password token issused successfully ✅, Check your email for the link.',
      });
      next();
    };
  }
}

module.exports = new ControlEmails();
