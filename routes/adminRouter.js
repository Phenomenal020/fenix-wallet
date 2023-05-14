const express = require("express");

const isAuth = require("../middleware/is-auth");
// const { check, body } = require("express-validator/check");

const adminController = require("../controllers/adminController");

const router = express.Router();

router.post("/activate", isAuth, adminController.postWallet);

router.post(
  "/approve", isAuth, adminController.postApproveTransfer
);

module.exports = router;