const express = require("express");
const { check, body } = require("express-validator/check");

const walletController = require("../controllers/walletController");

const router = express.Router();

router.get("/deposit", walletController.getDeposit);

router.get("/withdraw", walletController.getWithdraw);

router.get("/transfer", walletController.getTransfer);

router.get("/profile", walletController.getProfile);

router.post("/deposit", walletController.postDeposit);

router.post("/withdraw", walletController.postWithdraw);

router.post("/transfer", walletController.postTransfer);

module.exports = router;
