const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Тільки для адмінів
router.post('/', protect, restrictTo('admin'), upload.array('files'), productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.array('files'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;