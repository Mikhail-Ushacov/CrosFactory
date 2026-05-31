const prisma = require('../config/prisma');

class CategoryService {
  async getAll() {
    return await prisma.category.findMany();
  }
}

module.exports = new CategoryService();