const orderService = require('../services/order.service');
const jwt = require('jsonwebtoken');

exports.createOrder = async (req, res) => {
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try { user = jwt.decode(authHeader.split(' ')[1]); } catch (e) {}
  }
  const order = await orderService.createOrder(req.body, user);
  res.status(201).json(order);
};

exports.getMyOrders = async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
};