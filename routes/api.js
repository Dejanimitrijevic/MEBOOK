const express = require('express');
const route = express();
const authentication = require('./authentication');

/// API AUTHENTICATION ROUTE
route.use('/auth', authentication);

module.exports = route;
