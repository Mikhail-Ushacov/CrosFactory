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
      
      // 1. Перевірка, чи передано ID категорії
      if (!category_id) {
        return res.status(400).json({ message: "Виберіть категорію" });
      }

      const catId = parseInt(category_id);

      // 2. Перевірка, чи існує така категорія в БД
      const categoryExists = await prisma.category.findUnique({
        where: { id: catId }
      });

      if (!categoryExists) {
        return res.status(400).json({ message: `Категорії з ID ${catId} не існує. Створіть категорію спочатку.` });
      }

      const urls = JSON.parse(existing_urls || '[]');
      const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
      const allImages = [...urls, ...fileUrls];

      if (!category_id) {
        return res.status(400).json({ message: "Категорія обов'язкова" });
      }

      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          category: { connect: { id: catId } },
          images: {
            create: allImages.map(url => ({
              image: { create: { url } } // Створення запису в Image та зв'язку
            }))
          }
        }
      });
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      // Якщо помилка Prisma P2025 (Record not found)
      if (error.code === 'P2025') {
        return res.status(400).json({ message: "Вказаної категорії не існує" });
      }
      
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

// --- КЕРУВАННЯ КОНТЕНТОМ (БАНЕРИ ТА НОВИНИ) ---

// Отримання банерів (для головної)
app.get('/api/banners', async (req, res) => {
  const banners = await prisma.banner.findMany({
    include: { images: { include: { image: true } } }
  });
  res.json(banners.map(b => ({
    ...b,
    images: b.images.map(img => img.image.url)
  })));
});

// Створення банера
app.post('/api/banners', upload.array('files'), async (req, res) => {
  try {
    const { title, description, text, existing_urls } = req.body;
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    const banner = await prisma.banner.create({
      data: {
        title, description, text,
        images: { create: allImages.map(url => ({ image: { create: { url } } })) }
      }
    });
    res.status(201).json(banner);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/banners/:id', async (req, res) => {
  await prisma.banner.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Deleted" });
});

app.get('/api/banners/:id', async (req, res) => {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        images: { include: { image: true } },
        products: { 
          include: { 
            product: { 
              include: { 
                images: { include: { image: true }, take: 1 } 
              } 
            } 
          } 
        }
      }
    });

    if (!banner) return res.status(404).json({ message: "Банер не знайдено" });

    // Форматуємо відповідь під потреби фронтенда
    res.json({
      ...banner,
      images: banner.images.map(img => img.image.url),
      products: banner.products.map(p => ({
        ...p.product,
        main_image: p.product.images[0]?.image.url || ''
      }))
    });
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера: " + e.message });
  }
});

// Оновлення банера
app.put('/api/banners/:id', upload.array('files'), async (req, res) => {
  try {
    const bannerId = parseInt(req.params.id);
    const { title, description, text, existing_urls, productIds } = req.body;
    
    const urls = JSON.parse(existing_urls || '[]');
    const pIds = JSON.parse(productIds || '[]');
    const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    // Очищуємо старі зв'язки
    await prisma.bannerImage.deleteMany({ where: { bannerId } });
    await prisma.bannerProduct.deleteMany({ where: { bannerId } });

    const banner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        title, 
        description, 
        text,
        images: { 
          create: allImages.map(url => ({ 
            image: { create: { url } } 
          })) 
        },
        products: {
          create: pIds.map(pid => ({
            product: { connect: { id: parseInt(pid) } }
          }))
        }
      }
    });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Новини
app.get('/api/news', async (req, res) => {
  const news = await prisma.news.findMany({
    orderBy: { date: 'desc' },
    include: { images: { include: { image: true } } }
  });
  res.json(news.map(n => ({
    ...n,
    images: n.images.map(img => img.image.url)
  })));
});

app.post('/api/news', upload.array('files'), async (req, res) => {
  try {
    const { title, description, text, tag, existing_urls } = req.body;
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = req.files.map(file => `${BASE_URL}/content/${file.filename}`);
    
    const news = await prisma.news.create({
      data: {
        title, description, text, tag: tag || 'Новини',
        images: { create: [...urls, ...fileUrls].map(url => ({ image: { create: { url } } })) }
      }
    });
    res.status(201).json(news);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/news/:id', async (req, res) => {
  await prisma.news.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Deleted" });
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const item = await prisma.news.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { images: { include: { image: true } } }
    });
    if (!item) return res.status(404).json({ message: "Новину не знайдено" });
    
    res.json({
      ...item,
      images: item.images.map(img => img.image.url)
    });
  } catch (e) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// --- УНІВЕРСАЛЬНИЙ CRUD ДЛЯ АДМІНІСТРАТОРА ---

// Список доступних моделей (для безпеки)
const models = [
  'user', 'category', 'product', 'image', 'productImage', 
  'banner', 'bannerImage', 'news', 'newsImage', 'order', 'item'
];

// Middleware для перевірки ролі (адмін або модератор)
const isStaff = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin' && decoded.role !== 'moderator') throw new Error();
    req.userRole = decoded.role;
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(403).json({ message: "Доступ заборонено" });
  }
};

// Middleware тільки для повного адміна (для БД)
const isStrictAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== 'admin') throw new Error();
    next();
  } catch (e) {
    res.status(403).json({ message: "Тільки для адміністратора бази даних" });
  }
};

// Отримати всі записи таблиці
app.get('/api/admin/db/:model', isStrictAdmin, async (req, res) => {
  const { model } = req.params;
  if (!models.includes(model)) return res.status(400).json({ message: "Invalid model" });
  
  try {
    const data = await prisma[model].findMany();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Створити запис (з автоматичним приведенням типів)
app.post('/api/admin/db/:model', isStrictAdmin, async (req, res) => {
  const { model } = req.params;
  try {
    // Конвертуємо рядки в числа там, де це можливо, щоб Prisma не лаялась
    const data = Object.keys(req.body).reduce((acc, key) => {
      const val = req.body[key];
      // Якщо це число в рядку (і не порожній рядок) - конвертуємо
      if (typeof val === 'string' && val.trim() !== '' && !isNaN(val) && key !== 'login' && key !== 'password') {
        acc[key] = val.includes('.') ? parseFloat(val) : parseInt(val);
      } else {
        acc[key] = val;
      }
      return acc;
    }, {});

    const newItem = await prisma[model].create({ data });
    res.status(201).json(newItem);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Оновити запис (з автоматичним приведенням типів)
app.put('/api/admin/db/:model/:id', isStrictAdmin, async (req, res) => {
  const { model, id } = req.params;
  try {
    const data = Object.keys(req.body).reduce((acc, key) => {
      const val = req.body[key];
      if (typeof val === 'string' && val.trim() !== '' && !isNaN(val) && key !== 'login' && key !== 'password') {
        acc[key] = val.includes('.') ? parseFloat(val) : parseInt(val);
      } else {
        acc[key] = val;
      }
      return acc;
    }, {});

    const updated = await prisma[model].update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Видалити запис
app.delete('/api/admin/db/:model/:id', isStrictAdmin, async (req, res) => {
  const { model, id } = req.params;
  try {
    await prisma[model].delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/upload', isStrictAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл не завантажено" });
  }
  const fileUrl = `${BASE_URL}/content/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Окремий роут для статистики, доступний модератору
app.get('/api/admin/stats', isStaff, async (req, res) => {
  const orders = await prisma.order.findMany(); // Модератор отримає всі замовлення тут
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();
  res.json({ orders, productsCount, usersCount });
});

// --- НОВИНИ (Оновлено) ---

app.get('/api/news/:id', async (req, res) => {
  try {
    const item = await prisma.news.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        contentBlocks: {
          orderBy: { order: 'asc' },
          include: { 
            images: { include: { image: true } },
            products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } }
          }
        }
      }
    });
    
    if (!item) return res.status(404).json({ message: "Новину не знайдено" });
    
    // Форматуємо для фронтенда
    const formatted = {
      ...item,
      contentBlocks: item.contentBlocks.map(block => ({
        ...block,
        images: block.images.map(img => img.image.url),
        products: block.products.map(p => ({
          ...p.product,
          main_image: p.product.images[0]?.image.url || ''
        }))
      }))
    };
    
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- НОВИНИ (Уніфікований та виправлений роут) ---

// 1. Отримання списку (для NewsList)
app.get('/api/news', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { date: 'desc' },
      include: { 
        images: { include: { image: true } } // Головні фото новини
      }
    });
    res.json(news.map(n => ({
      ...n,
      images: n.images.map(img => img.image.url)
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Отримання детальної новини (для NewsDetails)
app.get('/api/news/:id', async (req, res) => {
  try {
    const item = await prisma.news.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { 
        images: { include: { image: true } },
        contentBlocks: {
          orderBy: { order: 'asc' },
          include: { 
            images: { include: { image: true } },
            products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } }
          }
        }
      }
    });
    
    if (!item) return res.status(404).json({ message: "Новину не знайдено" });
    
    res.json({
      ...item,
      images: item.images.map(img => img.image.url),
      contentBlocks: item.contentBlocks.map(block => ({
        ...block,
        images: block.images.map(img => img.image.url),
        products: block.products.map(p => ({
          ...p.product,
          main_image: p.product.images[0]?.image.url || ''
        }))
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// 3. Створення новини
app.post('/api/news', upload.any(), async (req, res) => {
  try {
    const { title, description, tag, contentBlocks } = req.body;
    const parsedBlocks = JSON.parse(contentBlocks || '[]');

    // Шукаємо файли для головного фото (якщо вони передані як 'files')
    const mainFiles = req.files.filter(f => f.fieldname === 'files');

    const news = await prisma.news.create({
      data: {
        title,
        description: description || "",
        tag: tag || 'Новини',
        // Головні зображення новини
        images: {
          create: mainFiles.map(file => ({
            image: { create: { url: `${BASE_URL}/content/${file.filename}` } }
          }))
        },
        contentBlocks: {
          create: parsedBlocks.map((block, index) => {
            // Файли конкретно для цього блоку
            const blockFiles = req.files.filter(f => f.fieldname === `block_images_${index}`);
            
            return {
              title: block.title,
              text: block.text,
              order: index,
              images: {
                create: blockFiles.map(file => ({
                  image: { create: { url: `${BASE_URL}/content/${file.filename}` } }
                }))
              },
              products: {
                create: (block.productIds || []).map(pid => ({
                  product: { connect: { id: parseInt(pid) } }
                }))
              }
            };
          })
        }
      }
    });
    res.status(201).json(news);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// --- БАНЕРИ (Оновлено) ---
app.get('/api/banners', async (req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' },
    include: { 
      images: { include: { image: true } },
      products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } }
    }
  });
  res.json(banners.map(b => ({
    ...b,
    images: b.images.map(img => img.image.url),
    products: b.products.map(p => ({
      ...p.product,
      main_image: p.product.images[0]?.image.url || ''
    }))
  })));
});

