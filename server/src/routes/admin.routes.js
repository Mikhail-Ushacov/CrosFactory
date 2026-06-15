const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');
const { BASE_URL } = require('../config/constants');
const adminController = require('../controllers/admin.controller');

// Доступ для Admin та Moderator (Статистика)
router.get('/stats', protect, restrictTo('admin', 'moderator'), adminController.getStats);

// ТІЛЬКИ для Admin (Керування БД)
router.use(protect, restrictTo('admin'));

const allowedModels = [
  'user', 'category', 'product', 'image', 'productImage', 
  'banner', 'bannerImage', 'news', 'newsImage', 'order', 'item',
  'newsBlock', 'newsBlockImage', 'newsBlockProduct', 'bannerProduct'
];

const formatData = (data) => {
  const skip = ['login', 'password', 'description', 'text', 'title', 'url', 'slug', 'tag', 'customerName', 'email', 'phone', 'address'];
  return Object.keys(data).reduce((acc, key) => {
    const val = data[key];
    if (typeof val === 'string' && val.trim() !== '' && !isNaN(val) && !skip.includes(key)) {
      acc[key] = val.includes('.') ? parseFloat(val) : parseInt(val);
    } else {
      acc[key] = val;
    }
    return acc;
  }, {});
};

router.get('/db/:model', async (req, res) => {
  if (!allowedModels.includes(req.params.model)) return res.status(400).send("Invalid model");
  
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const search = (req.query.search || '').trim();
  const where = {};
  if (search) {
    const textFields = {
      user: ['login', 'email', 'phone'],
      category: ['name', 'slug'],
      product: ['name', 'description'],
      order: ['customerName', 'email', 'phone', 'address'],
    };
    const fields = textFields[req.params.model] || ['id'];
    where.OR = fields.map(f => ({ [f]: { contains: search } }));
  }

  const [total, data] = await prisma.$transaction([
    prisma[req.params.model].count({ where }),
    prisma[req.params.model].findMany({ where, skip, take: limit })
  ]);

  res.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

router.post('/db/:model', async (req, res) => {
  const newItem = await prisma[req.params.model].create({ data: formatData(req.body) });
  res.status(201).json(newItem);
});

router.put('/db/:model/:id', async (req, res) => {
  const updated = await prisma[req.params.model].update({
    where: { id: parseInt(req.params.id) },
    data: formatData(req.body)
  });
  res.json(updated);
});

router.delete('/db/:model/:id', async (req, res) => {
  await prisma[req.params.model].delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: `${BASE_URL}/content/${req.file.filename}` });
});

module.exports = router;