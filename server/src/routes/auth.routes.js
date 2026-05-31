const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

router.post('/register', async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  const data = await authService.login(req.body);
  res.json(data);
});

module.exports = router;