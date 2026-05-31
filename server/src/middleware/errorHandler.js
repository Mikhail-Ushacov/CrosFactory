module.exports = (err, req, res, next) => {
  console.error('SERVER_ERROR:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутрішня помилка сервера';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};