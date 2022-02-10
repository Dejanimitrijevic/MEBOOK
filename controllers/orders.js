const ORDER = require('../models/order');
const USER = require('../models/user');

class OrdersOperations {
  constructor() {
    // PLACE A NEW ORDER BY USER
    this.placeNewOrder = async (req, res) => {
      const { order } = req;
      const user = await USER.findById(req.user.id)
        .select('+orders')
        .select('+cart');
      const newOrder = await ORDER.create(order);
      await user.orders.push(newOrder._id);
      user.cart = {};
      await user.save({ validateBeforeSave: false });
      res.status(201).json({
        status: 'success',
        msg: `Your order submitted successfully with ID ${newOrder._id}`,
      });
    };
  }
}
module.exports = new OrdersOperations();
