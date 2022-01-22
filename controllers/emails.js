const sendEmail = require('../utils/sendEmail');

class ControlEmails {
  constructor() {
    /// ACCOUNT VERIFICATION OTP EMAIL
    this.sendAccVerification = async (req, res, next) => {
      const { user, userId, token, otp } = req;
      // SEND EMAIL
      await sendEmail(user.email, 'otp', { otp });
      // SUCCESS RESPONSE
      res.status(201).json({
        status: 'success',
        msg: 'account created successfully ✅, Check your email for otp code.',
        data: {
          userId,
          user,
          token,
        },
      });
      next();
    };
    /// ACCOUNT USER FORGOT PASSWORD LINK EMAIL
    this.sendForgotPassword = async (req, res, next) => {
      const { token, userId, user } = req;
      const DOMAIN = process.env.HOST;
      //GENERATE URL
      const URL = `${DOMAIN}/reset-password/${userId}/${token}`;
      // SEND EMAIL
      await sendEmail(user.email, 'forgot_password', { URL });
      res.status(201).json({
        status: 'success',
        msg: 'reset password token issused successfully ✅, Check your email for the link.',
      });
      next();
    };
  }
}

module.exports = new ControlEmails();
