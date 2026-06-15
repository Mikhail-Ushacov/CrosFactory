const prisma = require('../config/prisma');

class CategoryService {
  async getAll(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const requestedLimit = parseInt(query.limit) || 50;
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    const where = {};
    const searchTerm = (query.search || '').trim();
    if (searchTerm) {
      where.name = { contains: searchTerm };
    }

    const [total, data] = await prisma.$transaction([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { products: true } }
        }
      })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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
    const { name, slug, isHidden, productIds } = data;
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.create({
        data: { name, slug, isHidden: !!isHidden }
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
    const { name, slug, isHidden, productIds } = data;

    return await prisma.$transaction(async (tx) => {
      // Створюємо об'єкт лише з тими полями, які реально прийшли
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (isHidden !== undefined) updateData.isHidden = !!isHidden;

      const updatedCategory = await tx.category.update({
        where: { id: categoryId },
        data: updateData
      });

      // Якщо прийшли ID товарів - оновлюємо зв'язки
      if (productIds) {
        const ids = productIds.map(pid => parseInt(pid));

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
