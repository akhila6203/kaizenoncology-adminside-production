
const express = require("express");

const ctrl = require("../controllers/faq.controller");

const authMiddleware = require(
  "../middleware/auth.middleware"
);

const router = express.Router();

// PUBLIC - User side FAQs
router.get("/", ctrl.list);

router.get("/:id", ctrl.getOne);

// ADMIN - Protected routes
router.post(
  "/",
  authMiddleware,
  ctrl.create
);

router.put(
  "/:id",
  authMiddleware,
  ctrl.update
);

router.delete(
  "/:id",
  authMiddleware,
  ctrl.remove
);

module.exports = router;



