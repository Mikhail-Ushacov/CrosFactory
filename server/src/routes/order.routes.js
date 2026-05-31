const express = require('express');
const router = express.Router();
const orderService = require('../services/order.service');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      user = jwt.decode(authHeader.split(' ')[1]);
    } catch (e) { user = null; }
  }
  
  const order = await orderService.createOrder(req.body, user);
  res.status(201).json(order);
});

router.get('/my', protect, async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
});

router.get('/:id', async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
});

module.exports = router;