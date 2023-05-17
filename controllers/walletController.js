const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const depositModel = require("../models/deposit.mongo");
const withdrawModel = require("../models/withdraw.mongo");
const TransferModel = require("../models/transfer.mongo");

exports.getDeposit = async (req, res) => {
  // get the user's wallet from the session. Use that to render the User's wallet balance
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  // Then render the deposit template
  res.render("deposit", {
    title: "Deposit",
    oldInput: {
      amount: null,
      to: req.session.user.walletAcctNumber,
    },
    firstName: req.session.user.profile.firstName,
    totalBalance: wallet.totalBalance,
    totalDeposits: wallet.totalDeposits,
    totalWithdrawals: wallet.totalWithdrawals,
  });
};

exports.getWithdraw = async (req, res) => {
  // get the user's wallet from the session. Use that to render the User's wallet balance
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  // then render the withdraw template
  res.render("withdraw", {
    title: "Withdraw",
    oldInput: {
      amount: null,
      from: req.session.user.walletAcctNumber,
    },
    firstName: req.session.user.profile.firstName,
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
    oldInput: {
      amount: "",
      to: "",
      from: req.session.user.walletAcctNumber,
    },
  });
};

exports.getProfile = (req, res) => {
  // Get the relavnt information from the session.
  res.render("view-profile", {
    layout: "profile",
    title: "Profile",
    firstName: req.session.user.profile.firstNam,
    lastName: req.session.user.profile.lastName,
    email: req.session.user.profile.email,
    accountNumber: req.session.user.walletAcctNumber,
  });
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postDeposit = async (req, res, next) => {
  // get the amount from the req body
  const { amount } = req.body;
  // convert it to a number
  const amountToNumber = parseInt(amount);
  try {
<<<<<<< Updated upstream
=======
    // get the amount from the req body
    const amount = req.body.amount;
    // convert it to a number
    const amountToNumber = parseInt(amount);
>>>>>>> Stashed changes
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
        to: req.session.user.walletAcctNumber,
      },
      errorMessage: req.flash("error")[0],
      firstName: req.session.user.profile.firstName,
    });
  }
};

// amount: from req.body0
// from: user will come from the req.session
// to: user will come from the body. it can be email, firstName, or last name
exports.postTransfer = async (req, res, next) => {
  try {
    // get the amount and to from the req body
    const to = req.body.to;
    const amount = req.body.amount
    // convert the amount to number
    const amountToNumber = parseInt(amount);
    // Get the reicipient user's wallet using the account number provided
    const receiverWallet = await Wallet.findOne({ accountNumber: to });
    // TODO: flash error and re-render the transfer page
    if (!receiverWallet){
      req.flash("error", "Account Number does not exist");
      const wallet = await Wallet.findOne({ userID: req.session.user._id });
      return res.render("transfer", {
        title: "Transfer",
        totalBalance: wallet.totalBalance,
        totalDeposits: wallet.totalDeposits,
        totalWithdrawals: wallet.totalWithdrawals,
        oldInput: {
          amount: req.body.amount,
          from: req.session.user.walletAcctNumber,
          to: req.body.to,
        },
        errorMessage: req.flash("error")[0],
        firstName: req.session ? req.session.user.profile.firstName : "",
      });
    }
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
        to: receiverWallet.accountNumber,
        from: userWallet.accountNumber,
        amount: amountToNumber,
      });
      // decrease wallet balance by amount
<<<<<<< Updated upstream
      userWallet.totalBalance -= amountToNumber;
      receiverWallet.totalBalance += amountToNumber;
      await transfer.save();
      await userWallet.save();
      await receiverWallet.save();
=======
      userWallet.totalBalance -= amount;
      recipientWallet.totalDeposits += amount;
      await transfer.save();
      await userWallet.save();
      await recipientWallet.save();
>>>>>>> Stashed changes
      req.flash(
        "success",
        `${amountToNumber} successfully transferred to ${to}`
      );
      return res.redirect("/");
    } else {
      // TODO: re-render the transfer page, passing in the relevant fields
      // req.flash("error", "Wallet balance is insufficient.");
      req.flash("error", error.message);
      const wallet = await Wallet.findOne({ userID: req.session.user._id });
      res.render("transfer", {
        title: "Transfer",
        oldInput: {
          amount: amountToNumber,
          from: req.session.user.walletAcctNumber,
          to: to,
        },
        totalBalance: wallet.totalBalance,
        totalDeposits: wallet.totalDeposits,
        totalWithdrawals: wallet.totalWithdrawals,
        errorMessage: req.flash("error")[0],
        firstName: req.session ? req.session.user.profile.firstName : "",
      });
    }
  } catch (error) {
    //TODO: handle errors
    console.error(error);
    req.flash("error", error.message);
    const wallet = await Wallet.findOne({ userID: req.session.user._id });
    res.render("transfer", {
      title: "Transfer",
      totalBalance: wallet.totalBalance,
      totalDeposits: wallet.totalDeposits,
      totalWithdrawals: wallet.totalWithdrawals,
      oldInput: {
        amount: req.body.amount,
        from: req.session.user.walletAcctNumber,
        to: req.body.to,
      },
      errorMessage: req.flash("error")[0],
      firstName: req.session ? req.session.user.profile.firstName : "",
    });
  }
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postWithdraw = async (req, res, next) => {
  try {
    // get the amount from the req body
    const amount = req.body.amount;
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
      //   if successful, render a withdrawal successful alert
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
