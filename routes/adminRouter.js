const express = require("express");

const { requireAdmin } = require("../middleware/is-auth");
// const { check, body } = require("express-validator/check");

const adminController = require("../controllers/adminController");
const Wallet = require("../models/wallet.mongo");

const router = express.Router();

<<<<<<< Updated upstream
router.post("/activate",isAuth, adminController.postActivateWallet);

router.post(
  "/approve",isAuth, adminController.postApproveTransfer
);
=======
router.get("/", requireAdmin, adminController.getHome);

router.get("/approve", requireAdmin, adminController.getApprove);
>>>>>>> Stashed changes

router.get("/activate", requireAdmin, adminController.getActivateWallet);

router.post("/activate", requireAdmin, adminController.postActivateWallet);

router.post("/approve", requireAdmin, adminController.postApproveTransfer);

module.exports = router;
