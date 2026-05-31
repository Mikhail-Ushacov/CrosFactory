const app = require('./src/app');
const { PORT, BASE_URL } = require('./src/config/constants');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
});