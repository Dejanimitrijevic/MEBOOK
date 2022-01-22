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
  validateVerifyAccountClient,
  validateResetPassClient,
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
  userLogout,
} = require('../controllers/auth');

const {
  sendAccVerification,
  sendForgotPassword,
} = require('../controllers/emails');

route.all('/', (req, res) => res.json({ msg: 'MEBOOK API AUTH' }));

route.post(
  '/register',
  sanitizeInputs,
  validateRegister,
  userRegister,
  initAccountVerification,
  sendAccVerification
);

route.post('/login', sanitizeInputs, validateLogin, userLogin);

route.post(
  '/verify/:userID/:token',
  authorize,
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
  userForgotPassword,
  sendForgotPassword
);

route.post(
  '/reset-password/:id/:token',
  sanitizeInputs,
  validateResetPassword,
  userResetPassword
);

route.get('/logout', authorize, userLogout);

/// FOR CLIENT SIDE
route.post(
  '/check_acc_verify/:userID/:token',
  // authorize,
  validateVerifyAccountClient
);
route.post(
  '/check_reset_pass/:userID/:token',
  // authorize,
  validateResetPassClient
);

module.exports = route;
