const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./shop.db');

// Инициализация БД
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    category TEXT,
    image TEXT,
    description TEXT
  )`);

  // Заполнение данными, если пусто
  db.get("SELECT count(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)");
      stmt.run("Смартфон X", 50000, "electronics", "https://picsum.photos/200", "Крутой смартфон");
      stmt.run("Ноутбук Y", 80000, "electronics", "https://picsum.photos/201", "Мощный ноут");
      stmt.run("Футболка", 1500, "clothing", "https://picsum.photos/202", "Хлопок 100%");
      stmt.finalize();
    }
  });
});

// API Эндпоинты
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  console.log('Order received:', req.body);
  res.status(201).json({ message: "Order created", id: Date.now() });
});

app.listen(3001, () => console.log('Server running on port 3001'));