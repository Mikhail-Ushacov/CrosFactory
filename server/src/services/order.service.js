const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

class OrderService {
  async createOrder(body, userFromToken) {
    const { cartItems, totalPrice, userData, type, details } = body;
    let userId;

    // 1. Перевірка наявності товарів у базі перед створенням замовлення
    const productIds = cartItems.map(item => parseInt(item.id));
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    });

    const existingIds = existingProducts.map(p => p.id);
    const missingIds = productIds.filter(id => !existingIds.includes(id));

    if (missingIds.length > 0) {
      const error = new Error(`Товари з ID ${missingIds.join(', ')} більше не існують. Оновіть кошик.`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Логіка з користувачем
    if (userFromToken) {
      // Перевіряємо, чи користувач все ще існує в БД
      const dbUser = await prisma.user.findUnique({ where: { id: userFromToken.id } });
      if (!dbUser) {
        const error = new Error("Користувача не знайдено. Будь ласка, перезайдіть в акаунт.");
        error.statusCode = 401;
        throw error;
      }
      userId = userFromToken.id;
    } else {
      // Для гостя створюємо нового користувача
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await prisma.user.create({
        data: { login: userData.login, password: hashedPassword, role: 'user' }
      });
      userId = newUser.id;
    }

    // 3. Створення замовлення
    return await prisma.order.create({
      data: {
        userId,
        sum: parseFloat(totalPrice),
        customerType: type,
        customerName: type === 'individual' ? details.fullName : details.companyName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        edrpou: details.edrpou || null,
        iban: details.iban || null,
        bank: details.bank || null,
        taxStatus: details.taxStatus || null,
        items: {
          create: cartItems.map(item => ({ 
            productId: parseInt(item.id), 
            quantity: parseInt(item.quantity) 
          }))
        }
      }
    });
  }

  async getMyOrders(userId) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: { items: { include: { product: true } } }
    });
  }

  async getOrderById(id) {
    return await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } }
    });
  }
}

module.exports = new OrderService();