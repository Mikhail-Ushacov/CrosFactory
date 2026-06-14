const prisma = require('../config/prisma');
const { BASE_URL } = require('../config/constants');

class BannerService {
  async getAll() {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
      include: { 
        images: { include: { image: true } },
        products: { include: { product: { include: { images: { include: { image: true }, take: 1 } } } } },
        bannerCategories: { include: { category: true } } // Згідно з вашою схемою
      }
    });
    return banners.map(b => this._formatBanner(b));
  }

  async getById(id) {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
      include: { 
        images: { include: { image: true } },
        products: { 
          include: { 
            product: { 
              include: { images: { include: { image: true }, take: 1 } } 
            } 
          } 
        },
        bannerCategories: { 
          include: { 
            category: { 
              include: { 
                products: { // Підтягуємо товари з категорій
                  include: { images: { include: { image: true }, take: 1 } }
                } 
              } 
            } 
          } 
        }
      }
    });
    if (!banner) throw new Error("Банер не знайдено");

    // Форматуємо дані для фронтенда
    const formattedBanner = this._formatBanner(banner);
    
    // Збираємо унікальний список усіх товарів (і прямих, і з категорій)
    const categoryProducts = banner.bannerCategories.flatMap(bc => 
      bc.category.products.map(p => ({
        ...p,
        main_image: p.images[0]?.image.url || ''
      }))
    );

    const directProducts = banner.products.map(p => ({
      ...p.product,
      main_image: p.product.images[0]?.image.url || ''
    }));

    // Об'єднуємо та видаляємо дублікати за ID
    const allProductsMap = new Map();
    [...directProducts, ...categoryProducts].forEach(p => allProductsMap.set(p.id, p));
    
    return {
      ...formattedBanner,
      allLinkedProducts: Array.from(allProductsMap.values())
    };
  }

  async create(data, files) {
    const { title, description, text, existing_urls, productIds, categoryIds } = data;
    const urls = JSON.parse(existing_urls || '[]');
    const pIds = JSON.parse(productIds || '[]');
    const cIds = JSON.parse(categoryIds || '[]');
    
    const fileUrls = files.map(file => `${BASE_URL}/content/${file.filename}`);
    const allImages = [...urls, ...fileUrls];

    return await prisma.banner.create({
      data: {
        title, 
        description: description || "", 
        text: text || "",
        // ВИПРАВЛЕНО: використовуємо connectOrCreate
        images: { 
          create: allImages.map(url => ({ 
            image: { 
              connectOrCreate: {
                where: { url },
                create: { url }
              }
            } 
          })) 
        },
        products: { create: pIds.map(pid => ({ product: { connect: { id: parseInt(pid) } } })) },
        bannerCategories: { create: cIds.map(cid => ({ category: { connect: { id: parseInt(cid) } } })) }
      }
    });
  }

  async update(id, data, files) {
    const bannerId = parseInt(id);
    const { title, description, text, existing_urls, productIds, categoryIds } = data;
    
    const urls = JSON.parse(existing_urls || '[]');
    const pIds = JSON.parse(productIds || '[]');
    const cIds = JSON.parse(categoryIds || '[]');
    
    const fileUrls = files ? files.map(file => `${BASE_URL}/content/${file.filename}`) : [];
    const allImages = [...urls, ...fileUrls];

    return await prisma.$transaction(async (tx) => {
      await tx.bannerImage.deleteMany({ where: { bannerId } });
      await tx.bannerProduct.deleteMany({ where: { bannerId } });
      await tx.bannerCategory.deleteMany({ where: { bannerId } });

      return await tx.banner.update({
        where: { id: bannerId },
        data: {
          title, description, text,
          // ВИПРАВЛЕНО: використовуємо connectOrCreate
          images: { 
            create: allImages.map(url => ({ 
              image: { 
                connectOrCreate: {
                  where: { url },
                  create: { url }
                }
              }
            })) 
          },
          products: { create: pIds.map(pid => ({ product: { connect: { id: parseInt(pid) } } })) },
          bannerCategories: { create: cIds.map(cid => ({ category: { connect: { id: parseInt(cid) } } })) }
        }
      });
    });
  }

  async updateOrder(orders) {
    const updates = orders.map((item, index) => {
      const id = typeof item === 'object' ? parseInt(item.id) : parseInt(item);
      const orderValue = (typeof item === 'object' && item.order !== undefined) ? parseInt(item.order) : index;
      if (isNaN(id)) return null;
      return prisma.banner.update({ where: { id }, data: { order: orderValue } });
    }).filter(Boolean);
    return await prisma.$transaction(updates);
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
      })),
      // Форматуємо bannerCategories у плоский масив categories
      categories: b.bannerCategories ? b.bannerCategories.map(bc => bc.category) : []
    };
  }
}

module.exports = new BannerService();