const adminService = require('../services/admin.service');
const { BASE_URL } = require('../config/constants');

exports.getStats = async (req, res) => {
  const stats = await adminService.getStats();
  res.json(stats);
};

exports.getModelData = async (req, res) => {
  const data = await adminService.getAll(req.params.model);
  res.json(data);
};

exports.createModelData = async (req, res) => {
  const item = await adminService.create(req.params.model, req.body);
  res.status(201).json(item);
};

exports.updateModelData = async (req, res) => {
  const item = await adminService.update(req.params.model, req.params.id, req.body);
  res.json(item);
};

exports.deleteModelData = async (req, res) => {
  await adminService.delete(req.params.model, req.params.id);
  res.json({ success: true });
};

exports.uploadFile = (req, res) => {
  if (!req.file) throw new Error("Файл не завантажено");
  res.json({ url: `${BASE_URL}/content/${req.file.filename}` });
};