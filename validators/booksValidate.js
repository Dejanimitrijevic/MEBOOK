const validator = require('validator');
const BOOK = require('../models/book');
const USER = require('../models/user');
const isDataMissed = require('../helpers/checkRequestData');

class BooksValidator {
  constructor() {
    this.validateCreateBook = async (req, res, next) => {
      // CHECK FOR NEEDED DATA
      if (isDataMissed(req.body, 'title')) {
        return res.status(400).json({
          status: 'error',
          msg: 'please enter the required fields to create book (title)',
        });
      }
      // CHECK IF BOOK WITH THE SAME TITLE IS EXIST
      const { title } = req.body;
      if (await BOOK.findOne({ title })) {
        return res.status(400).json({
          status: 'error',
          msg: 'a book with the same title is already exist.',
        });
      }
      // CONTINUE
      next();
    };
    // VALIDATE ADD BOOK TO USER WISHLIST
    this.validateAddToWishList = async (req, res, next) => {
      // GET USER ID AND BOOK ID FROM REQUEST BODY
      const { bookId } = req.body;
      if (!bookId) {
        return res.status(400).json({
          status: 'error',
          msg: 'please enter book id.',
        });
      }
      try {
        const book = await BOOK.findById(bookId);
        if (!book) {
          return res.status(400).json({
            status: 'error',
            msg: 'no book found with this id.',
          });
        }
        req.bookID = book._id;
        req.bookTitle = book.title;
        next();
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          msg: 'no book found with this id.',
        });
      }
    };
  }
}

module.exports = new BooksValidator();
