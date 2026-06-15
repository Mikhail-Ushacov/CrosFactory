const newsService = require('../services/news.service');

exports.getAllNews = async (req, res, next) => {
  try {
    const result = await newsService.getAll(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getNewsById = async (req, res, next) => {
  try {
    const item = await newsService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.createNews = async (req, res, next) => {
  try {
    const news = await newsService.create(req.body, req.files);
    res.status(201).json(news);
  } catch (err) {
    next(err);
  }
};

exports.deleteNews = async (req, res, next) => {
  try {
    await newsService.delete(req.params.id);
    res.json({ message: "Новину видалено" });
  } catch (err) {
    next(err);
  }
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await newsService.update(req.params.id, req.body, req.files);
    res.json(news);
  } catch (err) {
    next(err);
  }
};