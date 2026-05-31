const newsService = require('../services/news.service');

exports.getAllNews = async (req, res) => {
  const news = await newsService.getAll();
  res.json(news);
};

exports.getNewsById = async (req, res) => {
  const item = await newsService.getById(req.params.id);
  res.json(item);
};

exports.createNews = async (req, res) => {
  const news = await newsService.create(req.body, req.files);
  res.status(201).json(news);
};

exports.deleteNews = async (req, res) => {
  await newsService.delete(req.params.id);
  res.json({ message: "Новину видалено" });
};

exports.updateNews = async (req, res, next) => {
  try {
    const news = await newsService.update(req.params.id, req.body, req.files);
    res.json(news);
  } catch (err) {
    next(err);
  }
};