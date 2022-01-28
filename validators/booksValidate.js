const validator = require('validator');
const BOOK = require('../models/book');
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
  }
}

module.exports = new BooksValidator();
