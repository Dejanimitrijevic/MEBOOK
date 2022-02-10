const validator = require('validator');
const BOOK = require('../models/book');
const USER = require('../models/user');
const isDataMissed = require('../helpers/checkRequestData');

class OrdersValidators {
  constructor() {
    this.validatePlaceNewOrder = (req, res, next) => {
      if (
        isDataMissed(
          req.body,
          'billing_details',
          'user',
          'items',
          'quantity',
          'total_price'
        )
      ) {
        return res.status(400).json({
          status: 'error',
          msg: 'please enter the required fields to place an order',
        });
      }
      req.order = req.body;
      next();
    };
  }
}

module.exports = new OrdersValidators();
