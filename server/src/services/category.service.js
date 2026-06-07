const prisma = require('../config/prisma');

class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      }
    });
  }

  async getById(id) {
    return await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          select: { id: true, name: true, price: true }
        }
      }
    });
  }

  async create(data) {
    const { name, slug, productIds } = data;
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: { name, slug }
      });

      if (productIds && productIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: productIds.map(id => parseInt(id)) } },
          data: { categoryId: category.id }
        });
      }
      return category;
    });
  }

  async update(id, data) {
    const categoryId = parseInt(id);
    const { name, slug, productIds } = data;

    return await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id: categoryId },
        data: { name, slug }
      });

      if (productIds) {
        const ids = productIds.map(pid => parseInt(pid));
        // Прив'язуємо обрані товари до цієї категорії
        await tx.product.updateMany({
          where: { id: { in: ids } },
          data: { categoryId }
        });
      }

      return updatedCategory;
    });
  }

  async delete(id) {
    return await prisma.category.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new CategoryService();