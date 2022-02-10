const express = require('express');
const route = express();
const authentication = require('./authentication');
const books = require('./books_route');
const categories = require('./categories_route');
const order = require('./orders_route');

/// API AUTHENTICATION ROUTE
route.use('/auth', authentication);

/// API BOOKS ROUTE
route.use('/books', books);

/// API CATRGORIES ROUTE
route.use('/category', categories);

/// API ORDERS ROUTE
route.use('/orders', order);

module.exports = route;
