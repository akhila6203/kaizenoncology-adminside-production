
const express = require('express');

const ctrl = require('../controllers/settings.controller');


const {
  setUploadFolder,
  optionalFields,
} = require('../middleware/upload.middleware');

const router = express.Router();

// Get settings
router.get('/', ctrl.get);

// Update settings with optional Logo 1 and Logo 2 uploads
router.put(
  '/',
  setUploadFolder('settings'),
  optionalFields([
    { name: 'logo', maxCount: 1 },
    { name: 'logo2', maxCount: 1 },
  ]),
  ctrl.update
);

module.exports = router;






