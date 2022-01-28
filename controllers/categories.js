const CATEGORY = require('../models/category');
const SUB_CATEGORY = require('../models/sub_category');

class CategoriesOperations {
  constructor() {
    this.getAll = async (req, res, next) => {
      const categories = await CATEGORY.find()
        .populate('sub_categories')
        .exec();
      res.status(200).json({
        categories,
      });
      next();
    };
  }
}
module.exports = new CategoriesOperations();
