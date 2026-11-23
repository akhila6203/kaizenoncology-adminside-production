
const express = require("express");
const ctrl = require("../controllers/homeSlider.controller");
const upload = require("../middleware/homeSliderUpload");

const router = express.Router();

// Admin slider CRUD
router.get("/", ctrl.getAll);

router.post(
  "/",
  upload.single("image"),
  ctrl.create
);

router.put(
  "/:id",
  upload.single("image"),
  ctrl.update
);

router.delete("/:id", ctrl.delete);

module.exports = router;
