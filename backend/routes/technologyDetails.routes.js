const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ctrl = require('../controllers/technologyDetails.controller');

const router = express.Router();

const dir = path.join(__dirname, '..', 'uploads', 'technology');
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

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ success: true, url: `/uploads/technology/${req.file.filename}` });
});

router.get('/', ctrl.list);
router.get('/public', ctrl.listPublic);

router.post('/item', ctrl.createTechnology);
router.get('/item/:id', ctrl.getTechnology);
router.put('/item/:id', ctrl.updateTechnology);
router.delete('/item/:id', ctrl.deleteTechnology);

router.get('/:technologyId', ctrl.get);
router.put('/:technologyId', ctrl.save);

module.exports = router;