require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('./prisma/generated/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3001;
const SECRET_KEY = 'crosfactory_secret_key_2024';

app.use(cors());
app.use(express.json());

// --- АВТОРИЗАЦІЯ ---

app.post('/api/register', async (req, res) => {
  const { login, password, role } = req.body;
  if (!login || !password) return res.status(400).json({ message: "Дані обов'язкові" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'user'
      }
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

  const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, login: user.login, role: user.role } });
});

// --- МАГАЗИН ---

app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { take: 1 } // Беремо тільки перше фото як головне
    }
  });
  
  // Трансформуємо дані під формат фронтенда
  const result = products.map(p => ({
    ...p,
    category_name: p.category.name,
    category_slug: p.category.slug,
    main_image: p.images[0]?.url || ''
  }));
  
  res.json(result);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true, images: true }
  });

  if (!product) return res.status(404).json({ message: "Не знайдено" });

  res.json({
    ...product,
    category_name: product.category.name,
    images: product.images.map(img => img.url),
    main_image: product.images[0]?.url || ''
  });
});

app.post('/api/orders', (req, res) => {
  res.status(201).json({ message: "Order created", id: Date.now() });
});

// --- АДМІН-ПАНЕЛЬ ---

app.post('/api/products', async (req, res) => {
  const { name, price, description, category_id, main_image } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        categoryId: parseInt(category_id),
        images: main_image ? { create: { url: main_image } } : undefined
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, price, description, category_id } = req.body;
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        price: parseFloat(price),
        description,
        categoryId: parseInt(category_id)
      }
    });
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    // Завдяки onDelete: Cascade у схемі, картинки видаляться автоматично
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Prisma Server running on http://localhost:${PORT}`));