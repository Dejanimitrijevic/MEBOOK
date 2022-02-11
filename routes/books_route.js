const express = require('express');
const {
  createBook,
  getAll,
  getCategoryBooks,
  getSubCategoryBooks,
  addToWishlist,
  addToCart,
  removeFromCart,
} = require('../controllers/books');
const sanitizeInputs = require('../helpers/sanitizeInputs');
const {
  validateCreateBook,
  validateRemoveFromCart,
  validateAddToWishList,
} = require('../validators/booksValidate');
const { authorize } = require('../controllers/auth');

// INIT ROUTE
const books = express();

/// CREATE A NEW BOOK ROUTE
books.post('/new', sanitizeInputs, validateCreateBook, createBook);

/// GET ALL BOOKS
books.get('/all', getAll);

/// GET CATEGORY BOOKS
books.get('/category/:id', getCategoryBooks);

/// GET CATEGORY BOOKS
books.get('/sub_category/:id', getSubCategoryBooks);

/// ADD BOOK TO USER WISHLIST
books.post('/add_to_wishlist', authorize, validateAddToWishList, addToWishlist);

/// ADD AND REMOVE BOOK TO AND FROM USER CART
books.post('/add_to_cart', authorize, validateAddToWishList, addToCart);
books.post(
  '/remove_from_cart',
  authorize,
  validateRemoveFromCart,
  removeFromCart
);
module.exports = books;
