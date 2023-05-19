const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");
const depositModel = require("../models/deposit.mongo");
const withdrawModel = require("../models/withdraw.mongo");
const TransferModel = require("../models/transfer.mongo");
const { v4: uuidv4 } = require("uuid");
const numeral = require("numeral");

exports.getDeposit = async (req, res) => {
  const user = req.session.user;
  const checkUser = await ModelUser.findOne({
    "profile.email": user.profile.email,
  });
  if (!checkUser.active) {
    let firstName = req.session.user.profile.firstName;
    return res.render("deposit", {
      title: "Deposit",
      oldInput: {
        amount: null,
        to: req.session.user.walletAcctNumber,
      },
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      accountInactive: true,
    });
  }
  // get the user's wallet from the session. Use that to render the User's wallet balance
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  // Then render the deposit template
  let firstName = req.session.user.profile.firstName;
  return res.render("deposit", {
    title: "Deposit",
    oldInput: {
      amount: null,
      to: req.session.user.walletAcctNumber,
    },
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    totalBalance: numeral(wallet.totalBalance).format("0,0"),
    totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
    totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
  });
};

exports.getWithdraw = async (req, res) => {
  const user = req.session.user;
  const checkUser = await ModelUser.findOne({
    "profile.email": user.profile.email,
  });
  if (!checkUser.active) {
    let firstName = req.session.user.profile.firstName;
    return res.render("withdraw", {
      title: "Withdraw",
      oldInput: {
        amount: null,
        from: req.session.user.walletAcctNumber,
      },
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      accountInactive: true,
    });
  }
  // get the user's wallet from the session. Use that to render the User's wallet balance
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  // then render the withdraw template
  let firstName = req.session.user.profile.firstName;
  return res.render("withdraw", {
    title: "Withdraw",
    oldInput: {
      amount: null,
      from: req.session.user.walletAcctNumber,
    },
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    totalBalance: numeral(wallet.totalBalance).format("0,0"),
    totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
    totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
  });
};

exports.getTransfer = async (req, res) => {
  const user = req.session.user;
  const checkUser = await ModelUser.findOne({
    "profile.email": user.profile.email,
  });
  if (!checkUser.active) {
    let firstName = req.session.user.profile.firstName;
    return res.render("transfer", {
      title: "Transfer",
      oldInput: {
        amount: null,
        to: req.session.user.walletAcctNumber,
      },
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      totalBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      accountInactive: true,
    });
  }
  // get the user's wallet from the session. Use that to render the User's wallet balance
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  let firstName = req.session.user.profile.firstName;
  res.render("transfer", {
    title: "Transfer",
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    totalBalance: numeral(wallet.totalBalance).format("0,0"),
    totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
    totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
    oldInput: {
      amount: "",
      to: "",
      from: req.session.user.walletAcctNumber,
    },
  });
};

exports.getProfile = (req, res) => {
  // Get the relavnt information from the session.
  let firstName = req.session.user.profile.firstName;
  res.render("view-profile", {
    layout: "profile",
    title: "Profile",
    firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    lastName: req.session.user.profile.lastName,
    email: req.session.user.profile.email,
    accountNumber: req.session.user.walletAcctNumber,
    imageUrl: req.session.user.profile.imageUrl,
  });
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postDeposit = async (req, res, next) => {
  // get the amount from the req body
  const amount = req.body.amount;
  // convert it to a number
  const amountToNumber = parseInt(amount);
  // get the user from the session
  const user = req.session.user;
  try {
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
    // increase wallet balance and total deposits balance by amount
    wallet.totalBalance += amountToNumber;
    wallet.totalDeposits += amountToNumber;
    // save the deposit and updated wallet to the db
    await deposit.save();
    await wallet.save();
    req.flash(
      "success",
      `${amountToNumber} successfully deposited to ${acctNumber}`
    );
    // redirect to the homepage
    return res.redirect("/");
  } catch (error) {
    let firstName = req.session.user.profile.firstName;
    const wallet = await Wallet.findOne({ userID: req.session.user._id });
    req.flash("error", "An error occurred in the database. Try again later");
    res.render("deposit", {
      title: "Deposit",
      oldInput: {
        amount: amountToNumber,
        from: req.session.user.walletAcctNumber,
      },
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      errorMessage: req.flash("error")[0],
      totalBalance: wallet ? numeral(wallet.totalBalance).format("0,0") : 0,
      totalDeposits: wallet ? numeral(wallet.totalDeposits).format("0,0") : 0,
      totalWithdrawals: wallet
        ? numeral(wallet.totalWithdrawals).format("0,0")
        : 0,
    });
  }
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postWithdraw = async (req, res, next) => {
  // get the amount from the req body
  const amount = req.body.amount;
  const amountToNumber = parseInt(amount);
  // get the user from the req session
  const user = req.session.user;
  try {
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
      // increase wallet balance by amount
      wallet.totalBalance -= amountToNumber;
      wallet.totalWithdrawals += amountToNumber;
      await withdraw.save();
      await wallet.save();
      //   if successful, render a withdrawal successful alert
      req.flash(
        "success",
        `${amountToNumber} successfully withdrawn from ${acctNumber}`
      );
      return res.redirect("/");
    }
    req.flash("error", "Wallet balance is insufficient.");
    let firstName = req.session.user.profile.firstName;
    return res.render("withdraw", {
      title: "Wallet",
      oldInput: {
        amount: amountToNumber,
        from: acctNumber,
      },
      errorMessage: req.flash("error")[0],
      totalBalance: numeral(wallet.totalBalance).format("0,0"),
      totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
      totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    });
  } catch (error) {
    let firstName = req.session.user.profile.firstName;
    const wallet = await Wallet.findOne({ userID: req.session.user._id });
    req.flash("error", "An error occurred in the database. Try again later");
    return res.render("withdraw", {
      title: "Withdraw",
      oldInput: {
        amount: amountToNumber,
        from: req.session.user.walletAcctNumber,
      },
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      errorMessage: req.flash("error")[0],
      totalBalance: wallet ? numeral(wallet.totalBalance).format("0,0") : 0,
      totalDeposits: wallet ? numeral(wallet.totalDeposit).format("0,0") : 0,
      totalWithdrawals: wallet
        ? numeral(wallet.totalWithdrawals).format("0,0")
        : 0,
    });
  }
};

// amount: from req.body
// from: user will come from the req.session
// to: user will come from the body. it can be email, firstName, or last name
exports.postTransfer = async (req, res, next) => {
  // get the amount and to from the req body
  const to = req.body.to;
  const amount = req.body.amount;
  const uuid = uuidv4();
  // convert the amount to number
  const amountToNumber = parseInt(amount);
  try {
    // Get the reicipient user's wallet using the account number provided
    const receiverWallet = await Wallet.findOne({ accountNumber: to });
    // TODO: flash error and re-render the transfer page
    if (!receiverWallet) {
      req.flash("error", "Account Number does not exist");
      let firstName = req.session.user.profile.firstName;
      const wallet = await Wallet.findOne({ userID: req.session.user._id });
      return res.render("transfer", {
        title: "Transfer",
        totalBalance: numeral(wallet.totalBalance).format("0,0"),
        totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
        totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
        oldInput: {
          amount: req.body.amount,
          from: req.session.user.walletAcctNumber,
          to: req.body.to,
        },
        errorMessage: req.flash("error")[0],
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      });
    } else {
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
          transferString: uuid,
        });
        // decrease wallet balance by amount
        userWallet.totalBalance -= amountToNumber;
        userWallet.totalWithdrawals += amountToNumber;
        receiverWallet.totalBalance += amountToNumber;
        receiverWallet.totalDeposits += amountToNumber;
        await transfer.save();
        await userWallet.save();
        await receiverWallet.save();
        req.flash(
          "success",
          `${amountToNumber} successfully transferred to ${to}`
        );
        return res.redirect("/");
      }
      // TODO: re-render the transfer page, passing in the relevant fields
      req.flash("error", "Wallet balance is insufficient.");
      const wallet = await Wallet.findOne({ userID: req.session.user._id });
      let firstName = req.session.user.profile.firstName;
      return res.render("transfer", {
        title: "Transfer",
        oldInput: {
          amount: amountToNumber,
          from: req.session.user.walletAcctNumber,
          to: to,
        },
        totalBalance: numeral(wallet.totalBalance).format("0,0"),
        totalDeposits: numeral(wallet.totalDeposits).format("0,0"),
        totalWithdrawals: numeral(wallet.totalWithdrawals).format("0,0"),
        errorMessage: req.flash("error")[0],
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      });
    }
  } catch (error) {
    req.flash("error", error.message);
    const wallet = await Wallet.findOne({ userID: req.session.user._id });
    let firstName = req.session.user.profile.firstName;
    return res.render("transfer", {
      title: "Transfer",
      totalBalance: wallet ? numeral(wallet.totalBalance).format("0,0") : 0,
      totalDeposits: wallet ? numeral(wallet.totalDeposits).format("0,0") : 0,
      totalWithdrawals: wallet
        ? numeral(wallet.totalWithdrawals).format("0,0")
        : 0,
      oldInput: {
        amount: req.body.amount,
        from: req.session.user.walletAcctNumber,
        to: req.body.to,
      },
      errorMessage: req.flash("error")[0],
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const imageUrl = req.file ? req.file.filename : null;
  try {
    const updateUser = await ModelUser.findById({ _id: req.session.user._id });
    // Update the profile fields with the updated values
    firstName ? (updateUser.profile.firstName = firstName) : null;
    lastName ? (updateUser.profile.lastName = lastName) : null;
    email ? (updateUser.profile.email = email) : null;
    imageUrl ? (updateUser.profile.imageUrl = imageUrl) : null;

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
      imageUrl: respUser.profile.imageUrl,
      accountNumber: respUser.walletAcctNumber,
    });
  } catch (error) {
    // handle errors
    req.flash("error", error.message);
    res.render("view-profile", {
      layout: "profile",
      title: "Profile",
      errorMessage: req.flash("error")[0],
      firstName: req.session.user.profile.firstName,
      lastName: req.session.user.profile.lastName,
      email: req.session.user.profile.email,
      imageUrl: req.session.user.profile.imageUrl,
      accountNumber: req.session.user.profile.walletAcctNumber,
    });
  }
};
