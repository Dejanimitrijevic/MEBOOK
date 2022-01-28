const express = require('express');
const { createBook, getAll } = require('../controllers/books');
const sanitizeInputs = require('../helpers/sanitizeInputs');
const { validateCreateBook } = require('../validators/booksValidate');

// INIT ROUTE
const books = express();

/// CREATE A NEW BOOK ROUTE
books.post('/new', sanitizeInputs, validateCreateBook, createBook);

/// GET ALL BOOKS
books.get('/all', getAll);

module.exports = books;
