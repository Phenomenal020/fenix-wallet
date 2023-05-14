const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator/check");

exports.postActivateWallet = async (req, res, next) => {
  const user = req.session.user;
  try {
    const userWallet = await Wallet.findOne({ _id: user.walletId });
    userWallet.active = true;
    await userWallet.save();
    res.render("activation-success", {
      wallet: userWallet,
    });
  } catch (error) {
    res.status(500).render("activation-failure", {
      error: error.message,
    });
  }
};

exports.postApproveTransfer = async (req, res, next) => {
  const { transfer } = req.body;
  try {
    const newTransfer = await Wallet.findOne({ _id: transfer._id });
    if (!newTransfer) {
      return res.render("transfer-error", {
        error: "Invalid transfer",
      });
    }
    newTransfer.status = "approved";
    await newTransfer.save();
    return res.render("approve-success", {
      error: "Transfer approved",
    });
  } catch (error) {
    return res.status(500).render("transfer-error", {
      error: error.message,
    });
  }
};