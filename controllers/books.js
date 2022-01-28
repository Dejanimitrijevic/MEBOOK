const BOOK = require('../models/book');

class BookOperations {
  constructor() {
    // GET ALL BOOKS
    this.getAll = async (req, res, next) => {
      const books = await BOOK.find();
      res.status(200).json({
        status: 'success',
        books,
      });
      next();
    };
    // CREATE A NEW BOOK
    this.createBook = async (req, res, next) => {
      const book = await BOOK.create({ title: 'N?A' });
      res.status(201).json({
        status: 'success',
        msg: 'book created successfully ✅.',
        book,
      });
      next();
    };
  }
}
module.exports = new BookOperations();
