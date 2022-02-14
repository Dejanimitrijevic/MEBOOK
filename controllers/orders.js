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

    // CANCEL ORDER
    this.cancelOrder = async (req, res) => {
      const { orderId } = req.body;
      const user = await USER.findById(req.user.id)
        .select('+orders')
        .populate('orders');
      try {
        const userHasOrder = user.orders.find((order) => {
          return order.id === orderId;
        });
        if (!userHasOrder) {
          return res.status(404).json({
            status: 'error',
            msg: `No order found with this id ${orderId}`,
          });
        }
        if (userHasOrder) {
          const order = await ORDER.findById(orderId);
          if (order && order.status !== 'pending') {
            return res.status(401).json({
              status: 'error',
              msg: `Your order with id ${order.id} is already ${order.status}`,
            });
          } else {
            order.status = 'canceled';
            await order.save();
            res.status(202).json({
              status: 'success',
              msg: `Your order with id ${order.id} is canceled successfully`,
            });
          }
        }
      } catch (error) {
        return res.status(404).json({
          status: 'error',
          msg: `No order found with this id ${orderId}`,
        });
      }
    };
  }
}
module.exports = new OrdersOperations();
