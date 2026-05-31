const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

class OrderService {
  async createOrder(body, userFromToken) {
    const { cartItems, totalPrice, userData, type, details } = body;
    let userId;

    if (userFromToken) {
      userId = userFromToken.id;
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await prisma.user.create({
        data: { login: userData.login, password: hashedPassword, role: 'user' }
      });
      userId = newUser.id;
    }

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
          create: cartItems.map(item => ({ productId: item.id, quantity: item.quantity }))
        }
      }
    });
  }

  async getMyOrders(userId) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { id: 'desc' }
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