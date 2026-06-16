const prisma = require('../config/prisma');
const { BASE_URL } = require('../config/constants');

class ProductService {
  async getAll(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const requestedLimit = parseInt(query.limit) || 12;
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    const where = {};
    const andConditions = [];

    const searchTerm = (query.search || '').trim();
    if (searchTerm) {
      andConditions.push({
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { name: { contains: searchTerm } } }
        ]
      });
    }

    if (query.category && query.category !== 'all') {
      const catId = parseInt(query.category);
      if (!isNaN(catId)) {
        andConditions.push({ categoryId: catId });
      } else {
        andConditions.push({ category: { slug: query.category } });
      }
    }

    if (query.isOnSale === 'true') {
      andConditions.push({ isOnSale: true });
    }

    if (query.range_price) {
      const [min, max] = query.range_price.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        andConditions.push({
          OR: [
            { isOnSale: false, price: { gte: min, lte: max } },
            { isOnSale: true, salePrice: { gte: min, lte: max } }
          ]
        });
      }
    }

    const charKeys = Object.keys(query).filter(k => k.startsWith('range_') && k !== 'range_price');
    for (const key of charKeys) {
      const charName = key.replace('range_', '').toLowerCase();
      const [min, max] = query[key].split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        andConditions.push({
          characteristics: {
            some: {
              name: { contains: charName },
              value: { gte: min, lte: max }
            }
          }
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy = { id: 'desc' };
    if (query.sort === 'cheap') {
      orderBy = { price: 'asc' };
    } else if (query.sort === 'expensive') {
      orderBy = { price: 'desc' };
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { 
          category: true, 
          images: { include: { image: true }, take: 1 },
          characteristics: true
        }
      })
    ]);

    const formattedProducts = products.map(p => this._formatProduct(p));

    return {
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getBatch(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    
    const numericIds = ids.map(Number).filter(id => !isNaN(id));
    if (numericIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: numericIds } },
      include: {
        category: true,
        images: { include: { image: true }, take: 1 },
        characteristics: true
      }
    });

    const formatted = products.map(p => this._formatProduct(p));

    return numericIds
      .map(id => formatted.find(p => p.id === id))
      .filter(Boolean);
  }

  async getFilters(categoryParam) {
    const where = {};
    if (categoryParam && categoryParam !== 'all') {
      const catId = parseInt(categoryParam);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      } else {
        where.category = { slug: categoryParam };
      }
    }

    const products = await prisma.product.findMany({
      where,
      select: { price: true, salePrice: true, isOnSale: true, characteristics: true }
    });

    const filters = {};
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach(p => {
      const actualPrice = p.isOnSale && p.salePrice ? p.salePrice : p.price;
      if (actualPrice < minPrice) minPrice = actualPrice;
      if (actualPrice > maxPrice) maxPrice = actualPrice;

      p.characteristics.forEach(c => {
        const key = c.name.toLowerCase();
        if (!filters[key]) {
          filters[key] = { displayName: c.name, unit: c.unit, min: c.value, max: c.value };
        } else {
          filters[key].min = Math.min(filters[key].min, c.value);
          filters[key].max = Math.max(filters[key].max, c.value);
        }
      });
    });

    if (minPrice !== Infinity && maxPrice !== -Infinity) {
      filters['price'] = { displayName: 'Ціна', unit: '₴', min: minPrice, max: maxPrice };
    }

    return filters;
  }

  async getById(id) {
    const productId = parseInt(String(id).replace(/\D/g, ''));
    if (isNaN(productId)) {
      const error = new Error("Некоректний формат ID");
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        category: true, 
        images: { include: { image: true } }, 
        characteristics: true
      }
    });

    if (!product) {
      const error = new Error("Товар не знайдено");
      error.statusCode = 404;
      throw error;
    }
    
    return {
      ...product,
      category_name: product.category?.name || 'Без категорії',
      category_slug: product.category?.slug || '',
      category_id: product.categoryId,
      images: product.images.map(img => img.image.url),
      main_image: product.images[0]?.image.url || null
    };
  }

  async create(data, files) {
    const { name, price, description, catId, allImages, charList, isOnSale, salePrice } = this._parseProductData(data, files);

    return await prisma.product.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        description: description || "",
        isOnSale: isOnSale === 'true', // Приходить як рядок з FormData
        salePrice: isOnSale === 'true' ? parseFloat(salePrice) : null,
        category: { connect: { id: catId } },
        images: {
          create: allImages.map(url => ({
            image: {
              connectOrCreate: {
                where: { url: url },
                create: { url: url }
              }
            }
          }))
        },
      characteristics: {
          create: charList.map(c => ({
            name: c.name,
            value: parseFloat(c.value) || 0,
            unit: c.unit
          }))
        }
      },
      include: { images: { include: { image: true } } }
    });
  }

  async update(id, data, files) {
    const productId = parseInt(id);
    if (isNaN(productId)) throw new Error("Невірний ID товару");

    const { name, price, description, catId, allImages, charList, isOnSale, salePrice } = this._parseProductData(data, files);

    return await prisma.$transaction(async (tx) => {
      // Перевіряємо чи існує товар
      const existingProduct = await tx.product.findUnique({ where: { id: productId } });
      if (!existingProduct) throw new Error("Товар не знайдено");

      // 1. Видаляємо старі зв'язки
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.productCharacteristic.deleteMany({ where: { productId } });

      // 2. Оновлюємо товар
      return await tx.product.update({
        where: { id: productId },
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
          isOnSale: isOnSale === 'true',
          salePrice: isOnSale === 'true' ? parseFloat(salePrice) : null,
          category: { connect: { id: catId } },
          images: {
            create: allImages.map(url => ({
              image: {
                connectOrCreate: {
                  where: { url: url },
                  create: { url: url }
                }
              }
            }))
          },
        characteristics: {
            create: charList.map(c => ({
              name: c.name,
              value: parseFloat(c.value) || 0,
              unit: c.unit
            }))
          }
        },
        include: { 
          category: true, 
          images: { include: { image: true } } 
        }
      });
    });
  }

  async delete(id) {
    const productId = parseInt(id);
    return await prisma.product.delete({ where: { id: productId } });
  }

  _formatProduct(p) {
    return {
      ...p,
      category_id: p.categoryId,
      category_name: p.category?.name || '',
      category_slug: p.category?.slug || '',
      main_image: p.images[0]?.image.url || null,
      characteristics: p.characteristics,
    };
  }

  _parseProductData(data, files) {
    const { name, price, description, category_id, existing_urls, characteristics, isOnSale, salePrice } = data;
    const urls = JSON.parse(existing_urls || '[]');
    const charList = JSON.parse(characteristics || '[]');
    const fileUrls = files ? files.map(file => `${BASE_URL}/content/${file.filename}`) : [];
    const allImages = Array.from(new Set([...urls, ...fileUrls])).filter(url => url.trim() !== '');
    const catId = parseInt(category_id);
    if (isNaN(catId)) throw new Error("Невірний ID категорії");
    return { name, price, description, catId, allImages, charList, isOnSale, salePrice };
  }
}

module.exports = new ProductService();