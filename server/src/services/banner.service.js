const prisma = require('../config/prisma');
const { BASE_URL } = require('../config/constants');

class BannerService {
  async getAll() {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
      include: { 
        images: { include: { image: true } },
        products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } }
      }
    });
    return banners.map(b => this._formatBanner(b));
  }

  async getById(id) {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
      include: { 
        images: { include: { image: true } },
        products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } }
      }
    });
    if (!banner) throw new Error("Банер не знайдено");
    return this._formatBanner(banner);
  }

  async create(data, files) {
    const { title, description, text, existing_urls } = data;
    const urls = JSON.parse(existing_urls || '[]');
    const fileUrls = files.map(file => `${BASE_URL}/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    return await prisma.banner.create({
      data: {
        title, description, text,
        images: { create: allImages.map(url => ({ image: { create: { url } } })) }
      }
    });
  }

  async updateOrder(orders) {
  if (!Array.isArray(orders)) throw new Error("Дані мають бути масивом");

  const updates = orders.map((item, index) => {
    // Якщо item — це об'єкт (напр. {id: 15}), беремо item.id
    // Якщо item — це число (напр. 15), беремо саме його
    const id = typeof item === 'object' ? parseInt(item.id) : parseInt(item);
    
    // Порядок (order) — це просто індекс елемента в масиві
    const orderValue = (typeof item === 'object' && item.order !== undefined) 
      ? parseInt(item.order) 
      : index;

    if (isNaN(id)) return null;

    return prisma.banner.update({
      where: { id },
      data: { order: orderValue },
    });
  }).filter(Boolean);

  return await prisma.$transaction(updates);
}

  async update(id, data, files) {
    const bannerId = parseInt(id);
    const { title, description, text, existing_urls, productIds } = data;
    
    const urls = JSON.parse(existing_urls || '[]');
    const pIds = JSON.parse(productIds || '[]');
    const fileUrls = files.map(file => `${BASE_URL}/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    // Атомарна операція: видаляємо старі зв'язки та створюємо нові
    await prisma.bannerImage.deleteMany({ where: { bannerId } });
    await prisma.bannerProduct.deleteMany({ where: { bannerId } });

    return await prisma.banner.update({
      where: { id: bannerId },
      data: {
        title, description, text,
        images: { create: allImages.map(url => ({ image: { create: { url } } })) },
        products: { create: pIds.map(pid => ({ product: { connect: { id: parseInt(pid) } } })) }
      }
    });
  }

  async delete(id) {
    return await prisma.banner.delete({ where: { id: parseInt(id) } });
  }

  _formatBanner(b) {
    return {
      ...b,
      images: b.images.map(img => img.image.url),
      products: b.products.map(p => ({
        ...p.product,
        main_image: p.product.images[0]?.image.url || ''
      }))
    };
  }
}

module.exports = new BannerService();