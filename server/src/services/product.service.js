const prisma = require('../config/prisma');
const { BASE_URL } = require('../config/constants');

class ProductService {
  async getAll() {
    const products = await prisma.product.findMany({
      include: { 
        category: true, 
        images: { include: { image: true }, take: 1 } 
      }
    });
    return products.map(p => ({
      ...p,
      category_id: p.categoryId,
      category_name: p.category.name,
      category_slug: p.category.slug,
      main_image: p.images[0]?.image.url || null
    }));
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
        images: { include: { image: true } } 
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
    const { name, price, description, category_id, existing_urls } = data;
    
    // 1. Очищуємо та валідуємо вхідні дані
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = files ? files.map(file => `${BASE_URL}/content/${file.filename}`) : [];
    
    // ВИДАЛЯЄМО ДУБЛІКАТИ (вирішує 500 помилку)
    const allImages = Array.from(new Set([...urls, ...fileUrls])).filter(url => url.trim() !== '');

    const catId = parseInt(category_id);
    if (isNaN(catId)) throw new Error("Невірний ID категорії");

    return await prisma.product.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        description: description || "",
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
        }
      },
      include: { images: { include: { image: true } } }
    });
  }

  async update(id, data, files) {
    const productId = parseInt(id);
    if (isNaN(productId)) throw new Error("Невірний ID товару");

    const { name, price, description, category_id, existing_urls } = data;
    
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = files ? files.map(file => `${BASE_URL}/content/${file.filename}`) : [];
    
    // ВИДАЛЯЄМО ДУБЛІКАТИ (вирішує 500 помилку)
    const allImages = Array.from(new Set([...urls, ...fileUrls])).filter(url => url.trim() !== '');

    const catId = parseInt(category_id);
    if (isNaN(catId)) throw new Error("Невірний ID категорії");

    return await prisma.$transaction(async (tx) => {
      // Перевіряємо чи існує товар
      const existingProduct = await tx.product.findUnique({ where: { id: productId } });
      if (!existingProduct) throw new Error("Товар не знайдено");

      // 1. Видаляємо старі зв'язки
      await tx.productImage.deleteMany({ where: { productId } });

      // 2. Оновлюємо товар
      return await tx.product.update({
        where: { id: productId },
        data: {
          name,
          price: parseFloat(price) || 0,
          description: description || "",
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
}

module.exports = new ProductService();