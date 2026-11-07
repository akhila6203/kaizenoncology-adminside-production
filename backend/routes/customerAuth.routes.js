const express = require("express");

const controller = require(
  "../controllers/customerAuth.controller"
);

const router = express.Router();

router.post(
  "/register",
  controller.register
);

router.post(
  "/validate-activation-token",
  controller.validateActivationToken
);

router.post(
  "/set-password",
  controller.setPassword
);

router.post(
  "/login",
  controller.login
);

// NEW: Verify cookie session
router.get(
  "/session",
  controller.session
);

// NEW: Clear cookie session
router.post(
  "/logout",
  controller.logout
);

router.post(
  "/forgot-password",
  controller.forgotPassword
);

router.post(
  "/validate-reset-token",
  controller.validateResetToken
);

router.post(
  "/reset-password",
  controller.resetPassword
);

module.exports = router;





// const express = require("express");

// const controller = require(
//   "../controllers/customerAuth.controller"
// );

// const router = express.Router();

// router.post(
//   "/register",
//   controller.register
// );

// router.post(
//   "/validate-activation-token",
//   controller.validateActivationToken
// );
// router.post(
//   "/set-password",
//   controller.setPassword
// );

// router.post(
//   "/login",
//   controller.login
// );

// router.post(
//   "/forgot-password",
//   controller.forgotPassword
// );

// router.post(
//   "/validate-reset-token",
//   controller.validateResetToken
// );
// router.post(
//   "/reset-password",
//   controller.resetPassword
// );

// module.exports = router;