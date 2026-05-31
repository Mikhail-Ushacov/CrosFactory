const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

module.exports = router;