const express = require("express");

const { requireAdmin } = require("../middleware/is-auth");
// const { check, body } = require("express-validator/check");

const adminController = require("../controllers/adminController");
const Wallet = require("../models/wallet.mongo");

const router = express.Router();

router.get("/", requireAdmin, adminController.getHome);

router.get("/approve", requireAdmin, adminController.getApprove);

router.get("/activate", requireAdmin, adminController.getActivateWallet);

router.post("/activate", requireAdmin, adminController.postActivateWallet);

router.post("/approve", requireAdmin, adminController.postApproveTransfer);

module.exports = router;
