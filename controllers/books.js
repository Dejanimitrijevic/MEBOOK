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
      });
      next();
    };
    // ADD BOOK TO USER WISHLIST
    this.addToWishlist = async (req, res, next) => {
      const { bookID, bookTitle } = req;
      const user = await USER.findById(req.user._id).select('+wishlist');

      if (!user.wishlist.includes(bookID)) {
        user.wishlist.push(bookID);
        await user.save({ validateBeforeSave: false });
        res.status(200).json({
          status: 'success',
          msg: `${bookTitle} added to your wishlist ✅.`,
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
        });
      }
    };
    // ADD BOOK TO USER CART
    this.addToCart = async (req, res, next) => {
      const { bookID, bookTitle, bookPrice } = req;
      const { quantity } = req.body;
      const user = await USER.findById(req.user._id)
        .select('+cart')
        .populate('cart.items.item');
      if (
        !user.cart.items.length ||
        !user.cart.items.find((item) => {
          return String(item.item.id) === String(bookID);
        })
      ) {
        user.cart.items.push({
          item: bookID,
          subtotal: +bookPrice,
          quantity: quantity || 1,
        });
      } else {
        user.cart.items.find((item) => {
          if (String(item.item.id) === String(bookID)) {
            item.quantity += 1;
          }
        });
      }
      await user.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        msg: `${bookTitle} added to your shopping cart ✅.`,
      });
    };
    // REMOVR BOOK FROM USER CART
    this.removeFromCart = async (req, res, next) => {
      const { itemId } = req;
      const user = await USER.findById(req.user._id)
        .select('+cart')
        .populate('cart.items.item');
      user.cart.items = user.cart.items.filter((item) => {
        return item.id !== itemId;
      });
      await user.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        msg: `item removed from your shopping cart ✅.`,
      });
    };
  }
}
module.exports = new BookOperations();
