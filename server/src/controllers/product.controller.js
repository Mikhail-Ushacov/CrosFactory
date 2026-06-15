const productService = require('../services/product.service');

exports.getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAll(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getBatch = async (req, res, next) => {
  try {
    const result = await productService.getBatch(req.body.ids);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getFilters = async (req, res, next) => {
  try {
    const filters = await productService.getFilters(req.query.category);
    res.json(filters);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.create(req.body, req.files);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body, req.files);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.delete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};