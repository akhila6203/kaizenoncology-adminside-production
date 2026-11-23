const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ctrl = require('../controllers/serviceContent.controller');

const router = express.Router();

const dir = path.join(__dirname, '..', 'uploads', 'services');
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) =>
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed')),
});

// image upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
  res.json({ success: true, url: `/uploads/services/${req.file.filename}` });
});

// main services
router.get('/services', ctrl.listServices);
router.post('/services', ctrl.createService);
router.get('/services/:id', ctrl.getService);
router.put('/services/:id', ctrl.updateService);
router.delete('/services/:id', ctrl.deleteService);

// service pages
router.get('/pages', ctrl.listPages);
router.post('/pages', ctrl.createPage);
router.get('/pages/:id', ctrl.getPage);
router.put('/pages/:id', ctrl.updatePage);
router.delete('/pages/:id', ctrl.deletePage);

module.exports = router;