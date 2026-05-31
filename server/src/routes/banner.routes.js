const express = require('express');
const router = express.Router();
const bannerService = require('../services/banner.service');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', async (req, res) => {
  res.json(await bannerService.getAll());
});

router.patch('/reorder', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    // Витягуємо масив з будь-якого можливого ключа (тепер і з ids)
    const ordersArray = Array.isArray(req.body) 
      ? req.body 
      : (req.body.ids || req.body.banners || req.body.items);

    if (!ordersArray || !Array.isArray(ordersArray)) {
      return res.status(400).json({ 
        message: "Не знайдено масив даних. Очікувався формат { ids: [...] }" 
      });
    }

    await bannerService.updateOrder(ordersArray);
    res.json({ message: "Порядок оновлено" });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res) => {
  res.json(await bannerService.getById(req.params.id));
});

router.post('/', protect, restrictTo('admin'), upload.array('files'), async (req, res) => {
  const banner = await bannerService.create(req.body, req.files);
  res.status(201).json(banner);
});

router.put('/:id', protect, restrictTo('admin'), upload.array('files'), async (req, res) => {
  const banner = await bannerService.update(req.params.id, req.body, req.files);
  res.json(banner);
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  await bannerService.delete(req.params.id);
  res.json({ message: "Банер видалено" });
});

module.exports = router;