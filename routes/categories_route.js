const express = require('express');
const { getAll } = require('../controllers/categories');

// INIT ROUTE
const categories = express();

categories.get('/all', getAll);

module.exports = categories;
