require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('./prisma/generated/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// --- НАЛАШТУВАННЯ PRISMA ---
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();

// --- КОНФІГУРАЦІЯ З .ENV ---
const PORT = process.env.PORT || 3001;
const SERVER_IP = process.env.SERVER_IP || 'localhost';
const SECRET_KEY = process.env.SECRET_KEY || 'crosfactory_secret_key_2024';

// Базовий URL для зображень
const BASE_URL = `http://${SERVER_IP}:${PORT}`;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Створюємо папку для завантажень, якщо її немає
const contentDir = path.join(__dirname, 'content');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir);
}

// --- НАЛАШТУВАННЯ MULTER (ЗАХИСТ ТА ФІЛЬТРАЦІЯ) ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'content/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  // Дозволені MIME-типи
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимий формат файлу. Дозволені лише зображення (jpg, png, gif, webp)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Ліміт 5 МБ на один файл
  }
});

// Робимо папку статичною
app.use('/content', express.static(path.join(__dirname, 'content')));

// --- АВТОРИЗАЦІЯ ---

app.post('/api/register', async (req, res) => {
  const { login, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { login, password: hashedPassword, role: role === 'admin' ? 'admin' : 'user' }
    });
    res.status(201).json({ id: user.id, login: user.login, role: user.role });
  } catch (error) {
    res.status(400).json({ message: "Користувач вже існує" });
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  const user = await prisma.user.findUnique({ where: { login } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Невірний логін або пароль" });
  }
  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET_KEY);
  res.json({ token, user: { login: user.login, role: user.role } });
});

// --- МАГАЗИН ---

app.get('/api/categories', async (req, res) => {
  res.json(await prisma.category.findMany());
});

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, images: { take: 1 } }
  });
  res.json(products.map(p => ({
    ...p,
    category_name: p.category.name,
    category_slug: p.category.slug,
    main_image: p.images[0]?.url || ''
  })));
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, images: true }
    });
    if (!product) return res.status(404).json({ message: "Товар не знайдено" });
    res.json({
      ...product,
      category_name: product.category.name,
      images: product.images.map(img => img.url),
      main_image: product.images[0]?.url || ''
    });
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- АДМІН-ПАНЕЛЬ (З ОБРОБКОЮ ПОМИЛОК MULTER) ---

app.post('/api/products', (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { name, price, description, category_id, existing_urls } = req.body;
      
      const urls = JSON.parse(existing_urls || '[]');
      const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
      const allImages = [...urls, ...fileUrls];

      const validCategoryId = parseInt(category_id) || 1;

      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          category: {
            connect: { id: validCategoryId }
          },
          images: {
            create: allImages.map(url => ({ url }))
          }
        }
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("Помилка створення:", error);
      res.status(400).json({ message: error.message });
    }
  });
});

app.put('/api/products/:id', (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const productId = parseInt(req.params.id);
    try {
      const { name, price, description, category_id, existing_urls } = req.body;
      
      const urls = JSON.parse(existing_urls || '[]');
      const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
      const allImages = [...urls, ...fileUrls];

      const validCategoryId = parseInt(category_id) || 1;

      // Видаляємо старі посилання на фото в БД (самі файли залишаються в папці)
      await prisma.productImage.deleteMany({ where: { productId } });

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          category: {
            connect: { id: validCategoryId }
          },
          images: {
            create: allImages.map(url => ({ url }))
          }
        }
      });
      res.json(product);
    } catch (error) {
      console.error("Помилка оновлення:", error);
      res.status(400).json({ message: error.message });
    }
  });
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Спочатку видаляємо картинки, потім товар (залежить від налаштувань каскаду в Prisma)
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id: id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: "Помилка при видаленні" });
  }
});

// Слухаємо на 0.0.0.0, щоб сервер був доступний у локальній мережі
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
});