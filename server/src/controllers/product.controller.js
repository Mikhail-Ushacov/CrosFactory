exports.getProduct = async (req, res, next) => {
  console.log("Запит товару з ID:", req.params.id); // Це покаже, що саме приходить на сервер
  try {
    const product = await productService.getById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const productService = require('../services/product.service');

exports.getProducts = async (req, res) => {
  const products = await productService.getAll();
  res.json(products);
};

exports.getProduct = async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const product = await productService.create(req.body, req.files);
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.files);
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await productService.delete(req.params.id);
  res.json({ message: "Product deleted" });
};