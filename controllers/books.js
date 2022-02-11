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
      const allBooksLength = await BOOK.find();
      res.status(200).json({
        status: 'success',
        count: allBooksLength.length,
        books,
      });
      next();
    };
    // GET CATEGORY BOOKS
    this.getCategoryBooks = async (req, res) => {
      const features = new APIFeatures(
        BOOK.find({ category: req.params.id }),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const books = await features.query;
      const allBooksLength = await BOOK.find({ category: req.params.id });

      res.status(200).json({
        status: 'success',
        count: allBooksLength.length,
        books,
      });
    };
    // GET CATEGORY BOOKS
    this.getSubCategoryBooks = async (req, res) => {
      const features = new APIFeatures(
        BOOK.find({ sub_category: req.params.id }),
        req.query
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const books = await features.query;
      const allBooksLength = await BOOK.find({ sub_category: req.params.id });

      res.status(200).json({
        status: 'success',
        count: allBooksLength.length,
        books,
      });
    };
    // CREATE A NEW BOOK
    this.createBook = async (req, res, next) => {
      const book = await BOOK.create({ title: 'N?A' });
      res.status(201).json({
        status: 'success',
        msg: 'Book created successfully ✅',
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
          msg: `${bookTitle} added to your wishlist ✅`,
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
          msg: `${bookTitle} removed from your wishlist ✅`,
        });
      }
    };
    // ADD BOOK TO USER CART
    this.addToCart = async (req, res, next) => {
      const { bookID, bookTitle, bookPrice, bookQuantity } = req;
      const { quantity } = req.body;

      const book = await BOOK.findById(bookID);
      const user = await USER.findById(req.user._id)
        .select('+cart')
        .populate('cart.items.item');
      if (!book.quantity || !book.is_stock) {
        return res.status(400).json({
          status: 'error',
          msg: `This item is out of stock for now`,
        });
      }
      if (!quantity || quantity % 1 !== 0) {
        return res.status(400).json({
          status: 'error',
          msg: `Invalid quantity value`,
        });
      }
      if (quantity && bookQuantity && quantity > bookQuantity) {
        return res.status(400).json({
          status: 'error',
          msg: `Only ${bookQuantity} pieces available in stock`,
        });
      }
      if (user.cart.items_count >= 99) {
        return res.status(400).json({
          status: 'error',
          msg: `You reached the maximum cart items count, try remove some`,
        });
      }
      if (user.cart.items_count + +quantity > 99) {
        return res.status(400).json({
          status: 'error',
          msg: `The maximum cart items count is 99 items`,
        });
      }

      if (
        !user.cart.items.length ||
        !user.cart.items.find((item) => {
          return String(item.item.id) === String(bookID);
        })
      ) {
        user.cart.items.push({
          item: bookID,
          quantity: +quantity,
          subtotal: +bookPrice * +quantity,
        });
        book.quantity > 0 ? (book.quantity -= +quantity) : null;
      } else {
        user.cart.items.find((item) => {
          if (String(item.item.id) === String(bookID)) {
            item.quantity += +quantity;
            book.quantity > 0 ? (book.quantity -= +quantity) : null;
          }
        });
      }
      await user.save({ validateBeforeSave: false });
      await book.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        msg: `${bookTitle} added to your shopping cart ✅`,
      });
    };
    // REMOVR BOOK FROM USER CART
    this.removeFromCart = async (req, res) => {
      const { itemId } = req;
      const user = await USER.findById(req.user._id)
        .select('+cart')
        .populate('cart.items.item');
      user.cart.items.map(async (item) => {
        if (item.id === itemId) {
          const book = await BOOK.findById(item.item._id);
          book.quantity += +item.quantity;
          book.is_stock = true;
          await book.save({ validateBeforeSave: false });
        }
      });
      user.cart.items = user.cart.items.filter((item) => {
        return item.id !== itemId;
      });
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: 'success',
        msg: `item removed from your shopping cart`,
      });
    };
  }
}
module.exports = new BookOperations();
