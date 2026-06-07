const express = require('express');
const router = express.Router();
const categoryService = require('../services/category.service');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', async (req, res) => {
  res.json(await categoryService.getAll());
});

router.get('/:id', async (req, res) => {
  res.json(await categoryService.getById(req.params.id));
});

router.post('/', protect, restrictTo('admin'), async (req, res) => {
  res.status(201).json(await categoryService.create(req.body));
});

router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  res.json(await categoryService.update(req.params.id, req.body));
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  await categoryService.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;