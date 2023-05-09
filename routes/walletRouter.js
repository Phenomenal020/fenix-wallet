const express = require("express");
// const { check, body } = require("express-validator/check");

const walletController = require("../controllers/walletController");

const router = express.Router();

router.post("/deposit", walletController.postDeposit);

router.post("/withdraw", walletController.postWithdraw);

router.post("/transfer", walletController.postTransfer);

module.exports = router;
