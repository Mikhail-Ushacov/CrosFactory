const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'crosfactory_secret_key_2024';

class AuthService {
  async register({ login, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await prisma.user.create({
      data: { login, password: hashedPassword, role: role === 'admin' ? 'admin' : 'user' },
      select: { id: true, login: true, role: true }
    });
  }

  async login({ login, password }) {
    const user = await prisma.user.findUnique({ where: { login } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Невірний логін або пароль");
    }
    const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET_KEY);
    return { token, user: { login: user.login, role: user.role } };
  }
}
module.exports = new AuthService();