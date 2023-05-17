const Wallet = require("../models/wallet.mongo");
const ModelAdmin = require("../models/admin.mongo");
const bcrypt = require("bcryptjs");
const TransferModel = require("../models/transfer.mongo");
const ModelUser = require("../models/user.mongo");
const { Model } = require("mongoose");

// const { validationResult } = require("express-validator/check");
exports.getHome = async (req, res) => {
  try {
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    // TODO: I am using transfers as default
    const transfers = await TransferModel.find({ status: "pending" });
    let firstName = req.session.admin.profile.firstName;
    return res.render("home", {
      title: "Admin dashboard",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: resultBal[0].totalBalanceSum,
      totalDeposits: resultDeps[0].totalDepositSum,
      totalWithdrawals: resultWiths[0].totalWithdrawalSum,
      admin: true,
      transfers: transfers,
    });
  } catch (error) {
    console.log({ error });
  }
};

exports.getApprove = async (req, res, next) => {
  try {
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    const transfers = await TransferModel.find({ status: "pending" });
    let firstName = req.session.admin.profile.firstName;
    return res.render("approve", {
      title: "Admin dashboard",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: resultBal[0].totalBalanceSum,
      totalDeposits: resultDeps[0].totalDepositSum,
      totalWithdrawals: resultWiths[0].totalWithdrawalSum,
      admin: true,
      transfers: transfers,
    });
  } catch (error) {
    console.log({ error });
  }
};

exports.getActivateWallet = async (req, res, next) => {
  try {
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    const users = await ModelUser.find({ active: false });
    let firstName = req.session.admin.profile.firstName;
    return res.render("activate", {
      title: "Activate accounts",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: resultBal[0].totalBalanceSum,
      totalDeposits: resultDeps[0].totalDepositSum,
      totalWithdrawals: resultWiths[0].totalWithdrawalSum,
      admin: true,
      users: users,
    });
  } catch (error) {
    console.log({ error });
  }
};

// TODO: CORRECT YOUR CONTROLLERS. YOU SHOULD BE FETCHING WALLETS THAT ARE NOT ACTIVE
// THEN USE THE USER'S WALLET ACCOUNT NUMBER TO FETCH THE USER
exports.postActivateWallet = async (req, res, next) => {
  const accountNumber = req.body.walletAcctNumber;
  try {
    const user = await ModelUser.findOne({
      walletAcctNumber: accountNumber,
      active: false,
    });
    if (!user) {
      const resultBal = await Wallet.aggregate([
        { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
      ]);
      const resultDeps = await Wallet.aggregate([
        { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
      ]);
      const resultWiths = await Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalWithdrawalSum: { $sum: "$totalWithdrawals" },
          },
        },
      ]);
      const users = await ModelUser.find({ active: false });
      let firstName = req.session.admin.profile.firstName;
      req.flash("error", "Invalid account number or account already active");
      return res.render("activate", {
        title: "Activate accounts",
        errorMessage: req.flash("error")[0],
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        totalBalance: resultBal[0].totalBalanceSum,
        totalDeposits: resultDeps[0].totalDepositSum,
        totalWithdrawals: resultWiths[0].totalWithdrawalSum,
        admin: true,
        users: users,
      });
    }
    user.active = true;
    await user.save();
    req.flash("success", "User wallet successfully activated");
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    const users = await ModelUser.find({ active: false });
    let firstName = req.session.admin.profile.firstName;
    return res.render("activate", {
      title: "Activate accounts",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: resultBal[0].totalBalanceSum,
      totalDeposits: resultDeps[0].totalDepositSum,
      totalWithdrawals: resultWiths[0].totalWithdrawalSum,
      admin: true,
      users: users,
    });
  } catch (error) {
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    const users = await ModelUser.find({ active: false });
    let firstName = req.session.admin.profile.firstName;
    req.flash("error", error.message);
    return res.render("activate", {
      title: "Activate accounts",
      errorMessage: req.flash("error")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      admin: true,
      users: null,
    });
  }
};

exports.postApproveTransfer = async (req, res, next) => {
  const _id = req.body._id;
  try {
    const newTransfer = await Wallet.findOne({ _id: _id });
    if (!newTransfer) {
      const resultBal = await Wallet.aggregate([
        { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
      ]);
      const resultDeps = await Wallet.aggregate([
        { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
      ]);
      const resultWiths = await Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalWithdrawalSum: { $sum: "$totalWithdrawals" },
          },
        },
      ]);
      const transfers = await TransferModel.find({ status: "pending" });
      req.flash("error", "Transfer invalid");
      let firstName = req.session.admin.profile.firstName;
      return res.render("approve", {
        title: "Admin dashboard",
        errorMessage: req.flash("error")[0],
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        totalBalance: resultBal[0].totalBalanceSum,
        totalDeposits: resultDeps[0].totalDepositSum,
        totalWithdrawals: resultWiths[0].totalWithdrawalSum,
        admin: true,
        transfers: transfers,
      });
    }
    const resultBal = await Wallet.aggregate([
      { $group: { _id: null, totalBalanceSum: { $sum: "$totalBalance" } } },
    ]);
    const resultDeps = await Wallet.aggregate([
      { $group: { _id: null, totalDepositSum: { $sum: "$totalDeposits" } } },
    ]);
    const resultWiths = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawalSum: { $sum: "$totalWithdrawals" },
        },
      },
    ]);
    const transfers = await TransferModel.find({ status: "pending" });
    req.flash("error", "Transfer invalid");
    let firstName = req.session.admin.profile.firstName;
    return res.render("approve", {
      title: "Admin dashboard",
      errorMessage: req.flash("error")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: resultBal[0].totalBalanceSum,
      totalDeposits: resultDeps[0].totalDepositSum,
      totalWithdrawals: resultWiths[0].totalWithdrawalSum,
      admin: true,
      transfers: transfers,
    });
  } catch (error) {
    console.log({ error });
  }
};
