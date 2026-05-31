const multer = require('multer');
const path = require('path');
const fs = require('fs');

const contentDir = path.join(__dirname, '../../content');
if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, contentDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage,
  // limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;