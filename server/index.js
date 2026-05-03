const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'crosfactory_secret_key_2024'; // Секретний ключ для токенів

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./shop.db');

db.serialize(async () => {
  // 1. Таблиця категорій
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  )`);

  // 2. Таблиця товарів
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  // 3. Таблиця фотографій
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // 4. Таблиця користувачів (НОВА)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  )`);

  // --- Наповнення бази даними (Seed) ---

  // Створення адміна за замовчуванням (admin / 1234)
  db.get("SELECT * FROM users WHERE login = 'admin'", async (err, row) => {
    if (!row) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      db.run("INSERT INTO users (login, password, role) VALUES (?, ?, ?)", ['admin', hashedPassword, 'admin']);
      console.log("✅ Default admin created: login: admin, password: 1234");
    }
  });

  // Наповнення товарами, якщо база порожня
  db.get("SELECT count(*) as count FROM products", (err, row) => {
    if (row && row.count === 0) {
      console.log("Populating database with seed data...");
      
      const categories = [
        ['Електроніка', 'electronics'], ['Одежда', 'clothing'], ['Обувь', 'shoes'],
        ['Дом', 'home'], ['Красота', 'beauty'], ['Спорт', 'sports'],
        ['Книги', 'books'], ['Игрушки', 'toys'], ['Автотовары', 'auto'], ['Сад', 'garden']
      ];

      categories.forEach(([name, slug]) => {
        db.run("INSERT INTO categories (name, slug) VALUES (?, ?)", [name, slug], function(err) {
          const categoryId = this.lastID;
          for (let i = 1; i <= 2; i++) {
            const productName = `${name} Товар #${i}`;
            const price = Math.floor(Math.random() * 10000) + 500;
            db.run("INSERT INTO products (name, price, description, category_id) VALUES (?, ?, ?, ?)", 
              [productName, price, `Описание для ${productName}`, categoryId], function(err) {
                const productId = this.lastID;
                for (let j = 0; j < 5; j++) {
                  const imageUrl = `https://picsum.photos/seed/${productId}-${j}/400/400`;
                  db.run("INSERT INTO product_images (product_id, url) VALUES (?, ?)", [productId, imageUrl]);
                }
              }
            );
          }
        });
      });
    }
  });
});

// --- API Ендпоінти Авторизації ---

// Реєстрація нового користувача
app.post('/api/register', async (req, res) => {
  const { login, password, role } = req.body;
  
  if (!login || !password) {
    return res.status(400).json({ message: "Логін та пароль обов'язкові" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user'; // Обмеження ролей

    db.run("INSERT INTO users (login, password, role) VALUES (?, ?, ?)", 
      [login, hashedPassword, userRole], 
      function(err) {
        if (err) {
          return res.status(400).json({ message: "Користувач з таким логіном вже існує" });
        }
        res.status(201).json({ id: this.lastID, login, role: userRole });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Логін
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  db.get("SELECT * FROM users WHERE login = ?", [login], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Користувача не знайдено" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, login: user.login, role: user.role }
    });
  });
});

// --- API Ендпоінти Магазину ---

app.get('/api/categories', (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/products', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug, 
    (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as main_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;
  db.all(query, [], (err, rows) => {
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get("SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?", [req.params.id], (err, product) => {
    if (product) {
      db.all("SELECT url FROM product_images WHERE product_id = ?", [product.id], (err, images) => {
        product.images = images.map(img => img.url);
        product.main_image = product.images[0] || '';
        res.json(product);
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });
});

app.post('/api/orders', (req, res) => {
  res.status(201).json({ message: "Order created", id: Date.now() });
});

// --- Адмін-панель: CRUD товарів ---

// Створити товар
app.post('/api/products', (req, res) => {
  const { name, price, description, category_id, main_image } = req.body;
  db.run(
    "INSERT INTO products (name, price, description, category_id) VALUES (?, ?, ?, ?)",
    [name, price, description, category_id],
    function(err) {
      if (err) return res.status(400).json({ message: err.message });
      const productId = this.lastID;
      
      // Додаємо головне фото
      if (main_image) {
        db.run("INSERT INTO product_images (product_id, url) VALUES (?, ?)", [productId, main_image]);
      }
      res.status(201).json({ id: productId });
    }
  );
});

// Редагувати товар
app.put('/api/products/:id', (req, res) => {
  const { name, price, description, category_id } = req.body;
  db.run(
    "UPDATE products SET name = ?, price = ?, description = ?, category_id = ? WHERE id = ?",
    [name, price, description, category_id, req.params.id],
    function(err) {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ message: "Updated successfully" });
    }
  );
});

// Видалити товар
app.delete('/api/products/:id', (req, res) => {
  db.run("DELETE FROM product_images WHERE product_id = ?", [req.params.id], () => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
      if (err) return res.status(400).json({ message: err.message });
      res.json({ message: "Deleted successfully" });
    });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));