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
const PORT = 3001;
const SECRET_KEY = 'crosfactory_secret_key_2024';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Створюємо папку для завантажень, якщо її немає
const contentDir = path.join(__dirname, 'content');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir);
}

// Налаштування Multer для завантаження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'content/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Робимо папку статичною (щоб картинки відкривались у браузері)
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
    return res.status(401).json({ message: "Невірний" });
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
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true, images: true }
  });
  if (!product) return res.status(404).send();
  res.json({
    ...product,
    category_name: product.category.name,
    images: product.images.map(img => img.url),
    main_image: product.images[0]?.url || ''
  });
});

// --- АДМІН-ПАНЕЛЬ ---

app.post('/api/products', upload.array('files'), async (req, res) => {
  try {
    const { name, price, description, category_id, existing_urls } = req.body;
    
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = req.files.map(file => `http://localhost:3001/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    // Перевіряємо ID категорії (якщо NaN або порожньо - ставимо 1)
    const validCategoryId = parseInt(category_id) || 1;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        description: description || "",
        // ВИПРАВЛЕНО: використовуємо connect для зв'язку з категорією
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

app.put('/api/products/:id', upload.array('files'), async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const { name, price, description, category_id, existing_urls } = req.body;
    
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = req.files.map(file => `http://localhost:3001/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    const validCategoryId = parseInt(category_id) || 1;

    // 1. Спочатку чистимо старі картинки
    await prisma.productImage.deleteMany({ where: { productId } });

    // 2. Оновлюємо товар
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: parseFloat(price) || 0,
        description: description || "",
        // ВИПРАВЛЕНО: використовуємо connect для оновлення зв'язку
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

app.delete('/api/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));