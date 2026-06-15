const express = require('express');
const router = express.Router();
const newsService = require('../services/news.service');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');
const newsController = require('../controllers/news.controller');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

router.put('/:id', protect, restrictTo('admin'), upload.any(), newsController.updateNews);

router.post('/', protect, restrictTo('admin'), upload.any(), newsController.createNews);

router.delete('/:id', protect, restrictTo('admin'), newsController.deleteNews);

module.exports = router;