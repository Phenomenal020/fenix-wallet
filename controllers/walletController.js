const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const Transfer = require("../models/transfer.mongo");
const depositModel = require("../models/deposit.mongo");
const withdrawModel = require("../models/withdraw.mongo");

exports.getDeposit = async (req, res) => {
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  res.render("deposit", {
    title: "Deposit",
    oldInput: {
      amount: null,
      to: req.session.user.walletAcctNumber,
    },
    firstName: req.session ? req.session.user.profile.firstName : "",
    totalBalance: wallet.totalBalance,
    totalDeposits: wallet.totalDeposits,
    totalWithdrawals: wallet.totalWithdrawals,
  });
};

exports.getWithdraw = async (req, res) => {
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  res.render("withdraw", {
    title: "Withdraw",
    oldInput: {
      amount: null,
      from: req.session.user.walletAcctNumber,
    },
    firstName: req.session ? req.session.user.profile.firstName : "",
    totalBalance: wallet.totalBalance,
    totalDeposits: wallet.totalDeposits,
    totalWithdrawals: wallet.totalWithdrawals,
  });
};

exports.getTransfer = async (req, res) => {
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  res.render("transfer", {
    title: "Transfer",
    firstName: req.session ? req.session.user.profile.firstName : "",
    totalBalance: wallet.totalBalance,
    totalDeposits: wallet.totalDeposits,
    totalWithdrawals: wallet.totalWithdrawals,
  });
};

exports.getProfile = (req, res) => {
  res.render("view-profile", {
    layout: "profile",
    title: "Profile",
    firstName: req.session ? req.session.user.profile.firstName : "",
    lastName: req.session.user.profile.lastName,
    email: req.session.user.profile.email,
    accountNumber: req.session.user.walletAcctNumber,
  });
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postDeposit = async (req, res, next) => {
  try {
    // get the amount from the req body
    const { amount } = req.body;
    const amountToNumber = parseInt(amount);
    // get the user from the req session
    const user = req.session.user;
    // use the user to extract the walletId, then find the wallet using that id
    const wallet = await Wallet.findOne({ userID: user._id });
    // create a deposit object like this and save to the deposits collections
    // { to: this wallet id, amount: amount}
    let acctNumber = wallet.accountNumber;
    const deposit = new depositModel({
      walletId: wallet._id,
      to: wallet.accountNumber,
      amount: amountToNumber,
    });
    await deposit.save();
    // increase wallet balance by amount
    wallet.totalBalance += amountToNumber;
    wallet.totalDeposits += amountToNumber;
    //   if successful, render a deposit successful alert
    await wallet.save();
    req.flash(
      "success",
      `${amountToNumber} successfully deposited to ${acctNumber}`
    );
    return res.redirect("/");
  } catch (error) {
    // handle errors
    req.flash("error", error.message);
    res.render("deposit", {
      title: "Deposit",
      oldInput: {
        amount: amountToNumber,
        to: acctNumber,
      },
      errorMessage: req.flash("error")[0],
      to: req.session.user.walletAcctNumber,
    });
  }
};

// amount: from req.body
// from: user will come from the req.session
// to: user will come from the body. it can be email, firstName, or last name
exports.postTransfer = async (req, res, next) => {
  try {
    // get the amount from the req body
    const { to, amount } = req.body;
    const recipientWallet = await Wallet.find({ accountNumber: to });
    if (!recipientWallet) {
      return res.status(422).render("transfer-failure", {
        error: "Invalid account number",
      });
    }
    // get the user from the req session
    const user = req.session.user;
    // use the user to extract the walletId, then find the wallet using that id
    const userWallet = await Wallet.findOne({ userID: user.userID });
    // create a transfer object like this
    // { from: this wallet id,to: receipent wallet, amount: amount}
    // and
    // save to transfer database
    if (userWallet.balance >= amount) {
      const transfer = new Transfer({
        from: userWallet.accountNumber,
        to: recipientWallet.accountNumber,
        amount: amount,
      });
      // decrease wallet balance by amount
      userWallet.balance -= amount;
      // add this to the transfers array of the wallet
      userWallet.transfers.push(transfer);
      //await wallet.save();
      return res.render("/", {
        message: "transfer successful",
      });
    } else {
      req.flash("error", "Wallet balance is insufficient.");
      res.redirect("/deposit");
    }
  } catch (error) {
    // handle errors
    console.error(error);
    res.status(500).render("error", { error: "Internal server error" });
  }
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postWithdraw = async (req, res, next) => {
  try {
    // get the amount from the req body
    const { amount } = req.body;
    // get the user from the req session
    const user = req.session.user;
    const amountToNumber = parseInt(amount);
    // use the user to extract the walletId, then find the wallet using that id
    const wallet = await Wallet.findOne({ userID: user._id });
    // create a withdrawal object like this
    // { from: this wallet id, amount: amount}
    let acctNumber = wallet.accountNumber;
    if (wallet.totalBalance >= amountToNumber) {
      const withdraw = new withdrawModel({
        walletId: wallet._id,
        from: wallet.accountNumber,
        amount: amountToNumber,
      });
      await withdraw.save();
      // increase wallet balance by amount
      wallet.totalBalance -= amountToNumber;
      wallet.totalWithdrawals += amountToNumber;
      await wallet.save();
      //   if successful, render a deposit successful alert
      req.flash(
        "success",
        `${amountToNumber} successfully withdrawn from ${acctNumber}`
      );
      return res.redirect("/");
    } else {
      req.flash("error", "Wallet balance is insufficient.");
      res.render("withdraw", {
        title: "Wallet",
        oldInput: {
          amount: amountToNumber,
          from: acctNumber,
        },
        errorMessage: req.flash("error")[0],
      });
    }
  } catch (error) {
    req.flash("error", error.message);
    res.render("withdraw", {
      title: "Withdraw",
      oldInput: {
        amount: amountToNumber,
        to: acctNumber,
      },
      errorMessage: req.flash("error")[0],
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updateUser = await ModelUser.findById({ _id: req.session.user._id });
    // Update the profile fields with the updated values
    firstName ? (updateUser.profile.firstName = firstName) : null;
    lastName ? (updateUser.profile.lastName = lastName) : null;
    email ? (updateUser.profile.email = email) : null;
    // Save the updated user
    const respUser = await updateUser.save();
    req.session.user = respUser;
    req.flash("success", "Profile successfully updated");
    res.render("view-profile", {
      layout: "profile",
      title: "Profile",
      errorMessage: req.flash("error")[0],
      successMessage: req.flash("success")[0],
      firstName: respUser.profile.firstName,
      lastName: respUser.profile.lastName,
      email: respUser.profile.email,
      accountNumber: respUser.walletAcctNumber,
    });
  } catch (error) {
    req.flash("error", error.message);
    res.render("view-profile", {
      layout: "profile",
      title: "Profile",
      errorMessage: req.flash("error")[0],
      firstName: req.session ? req.session.user.profile.firstName : "",
      lastName: req.session ? req.session.user.profile.lastName : "",
      email: req.session ? req.session.user.profile.email : "",
      accountNumber: req.session
        ? req.session.user.profile.walletAcctNumber
        : "",
    });
  }
};
