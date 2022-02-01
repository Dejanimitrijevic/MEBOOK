const BOOK = require('../models/book');
const USER = require('../models/user');
const APIFeatures = require('../utils/apiFeatures');

class BookOperations {
  constructor() {
    // GET ALL BOOKS
    this.getAll = async (req, res, next) => {
      const features = new APIFeatures(BOOK.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const books = await features.query;
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
    // ADD BOOK TO USER WISHLIST
    this.addToWishlist = async (req, res, next) => {
      const { bookID, bookTitle } = req;
      const user = await USER.findOne(req.user).select('+wishlist');

      if (!user.wishlist.includes(bookID)) {
        user.wishlist.push(bookID);
        await user.save({ validateBeforeSave: false });
        res.status(200).json({
          status: 'success',
          msg: `${bookTitle} added to your wishlist ✅.`,
          data: { user },
        });
      } else if (user.wishlist.includes(bookID)) {
        const newWishList = user.wishlist.filter((item) => {
          if (String(bookID) !== String(item)) {
            return item;
          }
        });
        user.wishlist = newWishList;
        await user.save({ validateBeforeSave: false });
        res.status(200).json({
          status: 'success',
          msg: `${bookTitle} removed from your wishlist ✅.`,
          data: { user },
        });
      }
    };
  }
}
module.exports = new BookOperations();
