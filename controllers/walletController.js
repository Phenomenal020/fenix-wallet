const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const Transfer = require("../models/transfer.mongo");
const depositModel = require("../models/deposit.mongo");
const withdrawModel = require("../models/withdraw.mongo");
const TransferModel = require("../models/transfer.mongo");

exports.getDeposit = async (req, res) => {
  // get the user's wallet from the session. Use that to render the User's wallet balance
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
  // get the user's wallet from the session. Use that to render the User's wallet balance
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
  // get the user's wallet from the session. Use that to render the User's wallet balance
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
  // Get the relavnt information from the session.
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
    // convert it to a number
    const amountToNumber = parseInt(amount);
    // get the user from the session
    const user = req.session.user;
    // use the user to extract the walletId, then find the user's wallet using that id
    const wallet = await Wallet.findOne({ userID: user._id });
    // create a deposit object like this and save to the deposits collections
    // { to: this wallet id, amount: amount}
    let acctNumber = wallet.accountNumber; //copy the account number for rendering later
    const deposit = new depositModel({
      walletId: wallet._id,
      to: wallet.accountNumber,
      amount: amountToNumber,
    });
    // save the deposit to the db
    await deposit.save();
    // increase wallet balance and total deposits balance by amount
    wallet.totalBalance += amountToNumber;
    wallet.totalDeposits += amountToNumber;
    //   if successful, render a deposit successful alert
    await wallet.save();
    req.flash(
      "success",
      `${amountToNumber} successfully deposited to ${acctNumber}`
    );
    // redirect to the homepage
    return res.redirect("/");
  } catch (error) {
    // handle errors
    req.flash("error", error.message);
    res.render("deposit", {
      title: "Deposit",
      oldInput: {
        amount: amountToNumber,
        to: acctNumber
          ? acctNumber
          : req.session
          ? req.session.user.walletAcctNumber
          : "",
      },
      errorMessage: req.flash("error")[0],
      firstName: req.session ? req.session.user.profile.firstName : "",
    });
  }
};

// amount: from req.body
// from: user will come from the req.session
// to: user will come from the body. it can be email, firstName, or last name
exports.postTransfer = async (req, res, next) => {
  try {
    // get the amount and to from the req body
    const { to, amount } = req.body;
    // convert the amount to number
    const amountToNumber = parseInt(amount);
    // Get the reicipient user's wallet using the account number provided
    const recipientWallet = await Wallet.find({ accountNumber: to });
    // TODO: flash error and re-render the transfer page
    // if (!recipientWallet) {
    //   return res.status(422).render("transfer-failure", {
    //     error: "Invalid account number",
    //   });
    // }
    // get the user from the req session
    const user = req.session.user;
    // use the user to extract the walletId, then find the user's wallet using that id
    const userWallet = await Wallet.findOne({ userID: user._id });
    // create a transfer object like this
    // { from: this wallet id,to: receipent wallet, amount: amount}
    // and
    // save to transfer database
    if (userWallet.totalBalance >= amountToNumber) {
      const transfer = new TransferModel({
        from: userWallet.accountNumber,
        to: recipientWallet.accountNumber,
        amount: amount,
      });
      // decrease wallet balance by amount
      userWallet.totalBalance -= amount;
      await transfer.save();
      await userWallet.save();
      req.flash(
        "success",
        `${amountToNumber} successfully transferred to ${to}`
      );
      return res.redirect("/");
    } else {
      // TODO: re-render the transfer page, passing in the relevant fields
      // req.flash("error", "Wallet balance is insufficient.");
      res.redirect("/actions/deposit");
    }
  } catch (error) {
    //TODO: handle errors
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
    // handle errors
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
