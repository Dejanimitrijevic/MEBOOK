const express = require('express');
const { authorize, restrictToVerifiedUser } = require('../controllers/auth');
const { placeNewOrder, cancelOrder } = require('../controllers/orders');
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

/// CANCEL AN ORDER
orders.post('/cancel_order', authorize, cancelOrder);
module.exports = orders;
