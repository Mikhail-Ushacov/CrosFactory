const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'crosfactory_secret_key_2024';

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Необхідна авторизація" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Невірний токен" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ заборонено (недостатньо прав)" });
    }
    next();
  };
};

module.exports = { protect, restrictTo };