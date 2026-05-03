const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./shop.db');

db.serialize(() => {
  // 1. Таблица категорий
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  )`);

  // 2. Таблица товаров (связана с категориями)
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  // 3. Таблица фотографий (связана с товарами - 1 ко многим)
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Проверка на пустоту и заполнение
  db.get("SELECT count(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      console.log("Populating database with seed data...");
      
      const categories = [
        ['Электроника', 'electronics'], ['Одежда', 'clothing'], ['Обувь', 'shoes'],
        ['Дом', 'home'], ['Красота', 'beauty'], ['Спорт', 'sports'],
        ['Книги', 'books'], ['Игрушки', 'toys'], ['Автотовары', 'auto'], ['Сад', 'garden']
      ];

      categories.forEach(([name, slug]) => {
        db.run("INSERT INTO categories (name, slug) VALUES (?, ?)", [name, slug], function(err) {
          const categoryId = this.lastID;
          
          // Создаем по 2 товара в каждой категории (всего 20)
          for (let i = 1; i <= 2; i++) {
            const productName = `${name} Товар #${i}`;
            const price = Math.floor(Math.random() * 10000) + 500;
            
            db.run("INSERT INTO products (name, price, description, category_id) VALUES (?, ?, ?, ?)", 
              [productName, price, `Описание для ${productName}`, categoryId], function(err) {
                const productId = this.lastID;
                
                // Создаем по 5 фотографий для каждого товара
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

// API Эндпоинты

// Получить все категории
app.get('/api/categories', (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    res.json(rows);
  });
});

// Получить товары с их категориями и ПЕРВОЙ фотографией для каталога
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

// Получить полную информацию о товаре со всеми фото
app.get('/api/products/:id', (req, res) => {
  db.get("SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?", [req.params.id], (err, product) => {
    if (product) {
      db.all("SELECT url FROM product_images WHERE product_id = ?", [product.id], (err, images) => {
        product.images = images.map(img => img.url);
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

app.listen(3001, () => console.log('Server running on port 3001'));