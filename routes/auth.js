const express = require('express');
const route = express();
const sanitizeInputs = require('../helpers/sanitizeInputs');
const {
  validateRegister,
  validateLogin,
  validateVerifyAccount,
  validateReVerify,
  validateForgotPassword,
  validateResetPassword,
} = require('../helpers/validateAuth');
const {
  userRegister,
  userLogin,
  initAccountVerification,
  reAccountVerification,
  userAccountVerify,
  authorize,
  userForgotPassword,
  userResetPassword,
} = require('../controllers/auth');

route.get('/', authorize, (req, res) => {
  res.status(200).json({
    msg: 'ALL OK',
    user: req.user,
  });
});

route.post(
  '/register',
  sanitizeInputs,
  validateRegister,
  userRegister,
  initAccountVerification
);

route.post('/login', sanitizeInputs, validateLogin, userLogin);

route.post(
  '/verify/:userID/:token',
  sanitizeInputs,
  validateVerifyAccount,
  userAccountVerify
);

route.get(
  '/re-verify/:userID',
  authorize,
  validateReVerify,
  reAccountVerification
);

route.post(
  '/forgot-password',
  sanitizeInputs,
  validateForgotPassword,
  userForgotPassword
);

route.post(
  '/reset-password/:id/:token',
  sanitizeInputs,
  validateResetPassword,
  userResetPassword
);
module.exports = route;
