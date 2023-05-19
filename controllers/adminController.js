const Wallet = require("../models/wallet.mongo");
const ModelAdmin = require("../models/admin.mongo");
const bcrypt = require("bcryptjs");
const TransferModel = require("../models/transfer.mongo");
const DepositModel = require("../models/deposit.mongo");
const WithdrawalModel = require("../models/withdraw.mongo");
const ModelUser = require("../models/user.mongo");
const expressPaginate = require("express-paginate");
const paginate = expressPaginate.middleware;

const numeral = require("numeral");

exports.getHome = async (req, res) => {
  try {
    const filter = req.query.filter ? req.query.filter : null;
    let transferClass = null;
    let depositClass = null;
    let withdrawClass = null;

    const currPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 2;
    let totalItems = 0;
    let totalPages = 0;
    let data = [];
    let paginateData = {};

    const isEmpty = (await Wallet.countDocuments()) === 0;
    if (isEmpty) {
      let firstName = req.session.admin.profile.firstName;
      return res.render("home", {
        title: "Admin dashboard",
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        admin: true,
        pageEmpty: true
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

    if (!filter || filter === "transfer") {
      totalItems = await TransferModel.countDocuments();
      totalPages = Math.ceil(totalItems / itemsPerPage);
      data = await TransferModel.find()
        .skip((currPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
      transferClass = true;
    } else if (filter === "deposit") {
      totalItems = await DepositModel.countDocuments();
      totalPages = Math.ceil(totalItems / itemsPerPage);
      data = await DepositModel.find()
        .skip((currPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
      depositClass = true;
    } else if (filter === "withdrawal") {
      totalItems = await WithdrawalModel.countDocuments();
      totalPages = Math.ceil(totalItems / itemsPerPage);
      data = await WithdrawalModel.find()
        .skip((currPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
      withdrawClass = true;
    }
    
    let firstName = req.session.admin.profile.firstName;
    return res.render("home", {
      title: "Admin dashboard",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
      totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
      totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
        "0,0"
      ),
      admin: true,
      depositClass: depositClass,
      transferClass: transferClass,
      withdrawClass: withdrawClass,
      items: data,
      totalPages: totalPages,
      currPage: currPage,
      isFirstPage: currPage === 1,
      isLastPage: currPage === totalPages,
      hasPrev: currPage > 1,
      hasNext: totalPages > currPage,
      paginate: paginate,
      nextPage: currPage + 1,
      prevPage: currPage - 1,
      filter: filter,
      // pages: [2, 3, 4],
    });
  } catch (error) {
    console.log({ error });
  }
};

exports.getApprove = async (req, res, next) => {
  try {
    const isEmpty = (await Wallet.countDocuments()) === 0;
    if (isEmpty) {
      let firstName = req.session.admin.profile.firstName;
      return res.render("approve", {
        title: "Approve accounts",
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        admin: true,
        pageEmpty: true
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
    let firstName = req.session.admin.profile.firstName;
    return res.render("approve", {
      title: "Admin dashboard",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
      totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
      totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
        "0,0"
      ),
      admin: true,
      transfers: transfers,
    });
  } catch (error) {
    console.log({ error });
  }
};

exports.getActivateWallet = async (req, res, next) => {
  try {
    const isEmpty = (await Wallet.countDocuments()) === 0;
    if (isEmpty) {
      let firstName = req.session.admin.profile.firstName;
      return res.render("activate", {
        title: "Activate accounts",
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        admin: true,
        pageEmpty: true
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
    const users = await ModelUser.find({ active: false });
    let firstName = req.session.admin.profile.firstName;
    return res.render("activate", {
      title: "Activate accounts",
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
      totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
      totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
        "0,0"
      ),
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
        totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
        totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
        totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
          "0,0"
        ),
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
      totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
      totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
      totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
        "0,0"
      ),
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
  const transferString = req.body.transferString;
  try {
    const newTransfer = await TransferModel.findOne({
      transferString: transferString,
    });
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
        totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
        totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
        totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
          "0,0"
        ),
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
    newTransfer.status = "approved";
    const resp = await newTransfer.save();
    const transfers = await TransferModel.find({ status: "pending" });
    req.flash("error", "Transfer invalid");
    req.flash("success", "Transfer approved");
    let firstName = req.session.admin.profile.firstName;
    return res.render("approve", {
      title: "Admin dashboard",
      errorMessage: req.flash("error")[0],
      successMsg: req.flash("success")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: numeral(resultBal[0].totalBalanceSum).format("0,0"),
      totalDeposits: numeral(resultDeps[0].totalDepositSum).format("0,0"),
      totalWithdrawals: numeral(resultWiths[0].totalWithdrawalSum).format(
        "0,0"
      ),
      admin: true,
      transfers: transfers,
    });
  } catch (error) {
    console.log({ error });
  }
};
