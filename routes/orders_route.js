const express = require('express');
const { authorize, restrictToVerifiedUser } = require('../controllers/auth');
const { placeNewOrder } = require('../controllers/orders');
const sanitizeInputs = require('../helpers/sanitizeInputs');
const { validatePlaceNewOrder } = require('../validators/ordersValidate');

// INIT ROUTE
const orders = express();

/// PLACE A NEW ORDER BY USER

orders.post(
  '/new',
  authorize,
  restrictToVerifiedUser,
  sanitizeInputs,
  validatePlaceNewOrder,
  placeNewOrder
);
module.exports = orders;
