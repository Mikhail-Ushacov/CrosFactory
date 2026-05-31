require('dotenv').config();
//require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const newsRoutes = require('./routes/news.routes');
const bannerRoutes = require('./routes/banner.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());

// Статика для завантажених файлів (content лежить в корені папки server)
app.use('/content', express.static(path.join(__dirname, '../content')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

module.exports = app;