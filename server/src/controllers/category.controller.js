const categoryService = require('../services/category.service');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll(req.query);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
