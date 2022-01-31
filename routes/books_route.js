const express = require('express');
const { createBook, getAll, addToWishlist } = require('../controllers/books');
const sanitizeInputs = require('../helpers/sanitizeInputs');
const {
  validateCreateBook,
  validateAddToWishList,
} = require('../validators/booksValidate');
const { authorize } = require('../controllers/auth');

// INIT ROUTE
const books = express();

/// CREATE A NEW BOOK ROUTE
books.post('/new', sanitizeInputs, validateCreateBook, createBook);

/// GET ALL BOOKS
books.get('/all', getAll);

/// ADD BOOK TO USER WISHLIST
books.post('/add_to_wishlist', authorize, validateAddToWishList, addToWishlist);

module.exports = books;
