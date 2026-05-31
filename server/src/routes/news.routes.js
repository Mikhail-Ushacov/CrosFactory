const express = require('express');
const router = express.Router();
const newsService = require('../services/news.service');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');
const newsController = require('../controllers/news.controller');

router.get('/', async (req, res) => {
  const news = await newsService.getAll();
  res.json(news);
});

router.get('/:id', async (req, res) => {
  const item = await newsService.getById(req.params.id);
  res.json(item);
});

router.put('/:id', protect, restrictTo('admin'), upload.any(), newsController.updateNews);

// Захищені роути
router.post('/', protect, restrictTo('admin'), upload.any(), async (req, res) => {
  const news = await newsService.create(req.body, req.files);
  res.status(201).json(news);
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  await newsService.delete(req.params.id);
  res.json({ message: "Новину видалено" });
});

module.exports = router;