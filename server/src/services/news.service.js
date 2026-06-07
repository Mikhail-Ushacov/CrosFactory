const prisma = require('../config/prisma');
const { BASE_URL } = require('../config/constants');

class NewsService {
  async getAll() {
    const news = await prisma.news.findMany({
      orderBy: { date: 'desc' },
      include: { images: { include: { image: true } } }
    });
    return news.map(n => ({
      ...n,
      images: n.images.map(img => img.image.url)
    }));
  }

  async getById(id) {
    const item = await prisma.news.findUnique({
      where: { id: parseInt(id) },
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
    if (!item) throw new Error("Новину не знайдено");
    
    return {
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
    };
  }

  async create(body, files) {
    const { title, description, tag, contentBlocks } = body;
    const parsedBlocks = JSON.parse(contentBlocks || '[]');
    const mainFiles = files.filter(f => f.fieldname === 'files');

    return await prisma.news.create({
      data: {
        title,
        description: description || "",
        tag: tag || 'Новини',
        images: {
          create: mainFiles.map(f => ({
            image: { 
              connectOrCreate: {
                where: { url: `${BASE_URL}/content/${f.filename}` },
                create: { url: `${BASE_URL}/content/${f.filename}` }
              }
            }
          }))
        },
        contentBlocks: {
          create: parsedBlocks.map((block, index) => ({
            title: block.title,
            text: block.text,
            order: index,
            images: {
              create: files
                .filter(f => f.fieldname === `block_images_${index}`)
                .map(f => ({ image: { create: { url: `${BASE_URL}/content/${f.filename}` } } }))
            },
            products: {
              create: (block.productIds || []).map(pid => ({
                product: { connect: { id: parseInt(pid) } }
              }))
            }
          }))
        }
      }
    });
  }

  async update(id, body, files) {
  const newsId = parseInt(id);
  const { title, description, tag, contentBlocks, existing_urls } = body;
  
  const parsedBlocks = JSON.parse(contentBlocks || '[]');
  const existingMainUrls = JSON.parse(existing_urls || '[]');
  
  // Файли для головних фото новини
  const mainFiles = files.filter(f => f.fieldname === 'files');
  const mainFileUrls = mainFiles.map(f => `${BASE_URL}/content/${f.filename}`);
  const allMainImages = [...existingMainUrls, ...mainFileUrls];

  return await prisma.$transaction(async (tx) => {
    // 1. Видаляємо старі зображення та блоки (Prisma видалить зв'язані дані в блоках автоматично, якщо налаштовано Cascade)
    await tx.newsImage.deleteMany({ where: { newsId } });
    await tx.newsBlock.deleteMany({ where: { newsId } });

    // 2. Оновлюємо основні дані та створюємо нові блоки
    return await tx.news.update({
      where: { id: newsId },
      data: {
        title,
        description: description || "",
        tag: tag || 'Новини',
        images: {
          create: allMainImages.map(url => ({
            image: { create: { url } }
          }))
        },
        contentBlocks: {
          create: parsedBlocks.map((block, index) => ({
            title: block.title,
            text: block.text,
            order: index,
            images: {
              create: [
                // Додаємо існуючі фото блоку
                ...(block.existingImages || []).map(url => ({ 
                  image: { create: { url } } 
                })),
                // Додаємо нові завантажені фото блоку
                ...files
                  .filter(f => f.fieldname === `block_images_${index}`)
                  .map(f => ({ 
                    image: { create: { url: `${BASE_URL}/content/${f.filename}` } } 
                  }))
              ]
            },
            products: {
              create: (block.productIds || []).map(pid => ({
                product: { connect: { id: parseInt(pid) } }
              }))
            }
          }))
        }
      }
    });
  });
}

  async delete(id) {
    return await prisma.news.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new NewsService();