const express = require('express');
const auth = express();
const sanitizeInputs = require('../helpers/sanitizeInputs');
const {
  validateRegister,
  validateLogin,
  validateVerifyAccount,
} = require('../helpers/validateAuth');
const {
  userRegister,
  userLogin,
  initAccountVerification,
  userAccountVerify,
  isUserLoggedIn,
} = require('../controllers/auth');

auth.get('/', isUserLoggedIn);

auth.post(
  '/register',
  sanitizeInputs,
  validateRegister,
  userRegister,
  initAccountVerification
);
auth.post('/login', sanitizeInputs, validateLogin, userLogin);
auth.post(
  '/verify/:userID/:token',
  sanitizeInputs,
  validateVerifyAccount,
  userAccountVerify
);
auth.get('/re-verify/:userID', isUserLoggedIn, (req, res) => {
  res.send(':::');
});

module.exports = auth;
