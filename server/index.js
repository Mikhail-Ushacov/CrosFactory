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

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_IP = process.env.SERVER_IP || 'localhost';
const SECRET_KEY = process.env.SECRET_KEY || 'crosfactory_secret_key_2024';
const BASE_URL = `http://${SERVER_IP}:${PORT}`;

app.use(cors());
app.use(express.json());

const contentDir = path.join(__dirname, 'content');
if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'content/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

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
    include: { 
      category: true, 
      images: { 
        include: { image: true },
        take: 1 
      } 
    }
  });
  
  res.json(products.map(p => ({
    ...p,
    category_id: p.categoryId,
    category_name: p.category.name,
    category_slug: p.category.slug,
    main_image: p.images[0]?.image.url || '' // Звернення до Image.url
  })));
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        category: true, 
        images: { include: { image: true } } 
      }
    });
    if (!product) return res.status(404).json({ message: "Товар не знайдено" });
    
    res.json({
      ...product,
      category_name: product.category.name,
      images: product.images.map(img => img.image.url),
      main_image: product.images[0]?.image.url || ''
    });
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- АДМІН-ПАНЕЛЬ ---
app.post('/api/products', (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { name, price, description, category_id, existing_urls } = req.body;
      const urls = JSON.parse(existing_urls || '[]');
      const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
      const allImages = [...urls, ...fileUrls];

      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          category: { connect: { id: parseInt(category_id) || 1 } },
          images: {
            create: allImages.map(url => ({
              image: { create: { url } } // Створення запису в Image та зв'язку
            }))
          }
        }
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

app.put('/api/products/:id', (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const productId = parseInt(req.params.id);
    try {
      const { name, price, description, category_id, existing_urls } = req.body;
      const urls = JSON.parse(existing_urls || '[]');
      const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
      const allImages = [...urls, ...fileUrls];

      // Видаляємо старі зв'язки (Prisma видалить і Image, якщо налаштовано каскад)
      await prisma.productImage.deleteMany({ where: { productId } });

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          category: { connect: { id: parseInt(category_id) || 1 } },
          images: {
            create: allImages.map(url => ({
              image: { create: { url } }
            }))
          }
        }
      });
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Видалення товару призведе до видалення зв'язків у ProductImage через Cascade
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: "Помилка при видаленні" });
  }
});

app.post('/api/orders', async (req, res) => {
  const { cartItems, totalPrice, userData, type, details } = req.body;
  const authHeader = req.headers.authorization;

  try {
    let userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // КЕЙС 1: Користувач авторизований
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id;
    } else {
      // КЕЙС 2: Гість (створюємо новий аккаунт)
      if (!userData || !userData.login || !userData.password) {
        return res.status(400).json({ message: "Необхідно авторизуватися або вказати дані для реєстрації" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await prisma.user.create({
        data: {
          login: userData.login,
          password: hashedPassword,
          role: 'user'
        }
      });
      userId = newUser.id;
    }

    // 2. Створити замовлення
    const order = await prisma.order.create({
      data: {
        userId: userId,
        sum: parseFloat(totalPrice),
        customerType: type,
        customerName: type === 'individual' ? details.fullName : details.companyName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        edrpou: details.edrpou || null,
        iban: details.iban || null,
        bank: details.bank || null,
        taxStatus: details.taxStatus || null,
        items: {
          create: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }
      },
       include: { items: true }
    });

    res.status(201).json({ message: "Замовлення успішно створено", orderId: order.id });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: "Сесія застаріла" });
    res.status(500).json({ message: "Помилка при оформленні замовлення" });
  }
});

// Отримання списку замовлень користувача
app.get('/api/my-orders', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, SECRET_KEY);

  const orders = await prisma.order.findMany({
    where: { userId: decoded.id },
    orderBy: { id: 'desc' }
  });
  res.json(orders);
});

// Отримання конкретного замовлення для накладної
app.get('/api/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { items: { include: { product: true } } }
  });
  res.json(order);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
});