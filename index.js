const fs = require('fs');
const file = fs.readFileSync(`${__dirname}/data/books.json`, 'utf-8');
const data = JSON.parse(file);
const collection = require('./models/book');

// NODE JS ENVIRONMENT VARIABLES
require('dotenv').config('./.env');

// CONNECT MONGO DATABASE
const {
  connectDB,
  updateDbCollection,
  clearCollection,
} = require('./database');
connectDB();
// clearCollection(collection);
// updateDbCollection(collection, data);

// CONNECT API SERVER
require('./server');
