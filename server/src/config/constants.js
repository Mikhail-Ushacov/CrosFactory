const PORT = process.env.PORT || 3001;
const SERVER_IP = process.env.SERVER_IP || 'localhost';
const BASE_URL = `http://${SERVER_IP}:${PORT}`;

module.exports = {
  PORT,
  SERVER_IP,
  BASE_URL
};