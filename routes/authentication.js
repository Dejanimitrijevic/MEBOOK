const express = require('express');
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
  validateAdminLogin,
} = require('../helpers/validateAuth');

const {
  sendAccVerification,
  sendNewOtp,
  sendForgotPassword,
} = require('../controllers/emails');

const {
  userRegister,
  initAccountVerification,
  userLogin,
  reAccountVerification,
  userAccountVerify,
  authorize,
  userForgotPassword,
  userResetPassword,
  userLogout,
  getUserData,
} = require('../controllers/auth');

// INIT ROUTE
const auth = express();

/// AUTHENTICATION USER REGISTER ROUTE
auth.post(
  '/register',
  sanitizeInputs,
  validateRegister,
  userRegister,
  initAccountVerification,
  sendAccVerification
);

/// AUTHENTICATION USER LOGIN ROUTE
auth.post('/login', sanitizeInputs, validateLogin, userLogin);
auth.post('/admin_login', validateAdminLogin, userLogin);

/// AUTHENTICATION USER VERIFY ACCOUNT ROUTE
auth.post(
  '/verify/:userID/:token',
  authorize,
  sanitizeInputs,
  validateVerifyAccount,
  userAccountVerify
);

/// AUTHENTICATION USER VERIFY ACCOUNT RE_PROCESS ROUTE
auth.get(
  '/re-verify/:userID',
  authorize,
  validateReVerify,
  reAccountVerification,
  sendNewOtp
);

/// AUTHENTICATION USER FORGOT ACCOUNT PASSWORD ROUTE
auth.post(
  '/forgot-password',
  sanitizeInputs,
  validateForgotPassword,
  userForgotPassword,
  sendForgotPassword
);

auth.post(
  '/reset-password/:id/:token',
  sanitizeInputs,
  validateResetPassword,
  userResetPassword
);

/// AUTHENTICATION USER LOGOUT ROUTE
auth.get('/logout', userLogout);

/// AUTHENTICATION GET USER DATA ROUTE
auth.get('/current_user', authorize, getUserData);

/// FOR CLIENT SIDE
auth.post('/check_acc_verify/:userID/:token', validateVerifyAccountClient);
auth.post('/check_reset_pass/:id/:token', validateResetPassClient);

module.exports = auth;
