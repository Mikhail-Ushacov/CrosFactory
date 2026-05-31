const prisma = require('../config/prisma');

class AdminService {
  formatData(data) {
    const skip = ['login', 'password', 'description', 'text', 'title', 'url', 'slug', 'tag', 'customerName', 'email', 'phone', 'address'];
    return Object.keys(data).reduce((acc, key) => {
      const val = data[key];
      if (typeof val === 'string' && val.trim() !== '' && !isNaN(val) && !skip.includes(key)) {
        acc[key] = val.includes('.') ? parseFloat(val) : parseInt(val);
      } else {
        acc[key] = val;
      }
      return acc;
    }, {});
  }

  async getStats() {
    const [orders, productsCount, usersCount] = await Promise.all([
      prisma.order.findMany({ orderBy: { id: 'desc' }, take: 10 }),
      prisma.product.count(),
      prisma.user.count()
    ]);
    return { orders, productsCount, usersCount };
  }

  async getAll(model) {
    return await prisma[model].findMany();
  }

  async create(model, data) {
    return await prisma[model].create({ data: this.formatData(data) });
  }

  async update(model, id, data) {
    return await prisma[model].update({
      where: { id: parseInt(id) },
      data: this.formatData(data)
    });
  }

  async delete(model, id) {
    return await prisma[model].delete({ where: { id: parseInt(id) } });
  }
}

module.exports = new AdminService();