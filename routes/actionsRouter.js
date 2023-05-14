const express = require("express");
const { check, body } = require("express-validator/check");

const walletController = require("../controllers/walletController");
const { requireAuth } = require("../middleware/is-auth");

const router = express.Router();

router.get("/deposit", requireAuth, walletController.getDeposit);

router.get("/withdraw", requireAuth, walletController.getWithdraw);

router.get("/transfer", requireAuth, walletController.getTransfer);

router.get("/profile", requireAuth, walletController.getProfile);

router.post("/deposit", requireAuth, walletController.postDeposit);

router.post("/withdraw", requireAuth, walletController.postWithdraw);

router.post("/transfer", requireAuth, walletController.postTransfer);

router.post("/profile", requireAuth, walletController.updateProfile);

module.exports = router;
