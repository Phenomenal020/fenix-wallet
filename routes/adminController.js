const express = require("express");
// const { check, body } = require("express-validator/check");

const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/activate", adminController.postWallet);

router.post("/approve", adminController.postApproveTransfer);

module.exports = router;