const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const Transfer = require("../models/transfer.mongo");

exports.getDeposit = (req, res) => {
  res.render("deposit", {
    title: "Deposit",
    // csrfToken: req.csrfToken()  // deprecate
  });
};

exports.getWithdraw = (req, res) => {
  res.render("withdraw", {
    title: "Withdraw",
    // csrfToken: req.csrfToken()  // deprecated
  });
};

exports.getTransfer = (req, res) => {
  res.render("transfer", {
    title: "Transfer",
    // csrfToken: req.csrfToken()  // deprecated
  });
};

exports.getProfile = (req, res) => {
  res.render("view-profile", {
    layout: "profile",
    title: "Profile",
    // csrfToken: req.csrfToken()  // deprecated
  });
};

// req.body = {amount: N500}
// user will come from the req.session
exports.postDeposit = async (req, res, next) => {
  try {
    // get the amount from the req body
    const { amount } = req.body;
    // get the user from the req session
    const user = req.session.user;
    // use the user to extract the walletId, then find the wallet using that id
    const wallet = await Wallet.findOne({ userID: user.userID });
    // create a deposit object like this
    // { to: this wallet id, amount: amount}
    const deposit = {
      to: wallet.accountNumber,
      amount: amount,
    };
    // add this to the deposit array of the wallet
    wallet.deposits.push(deposit);
    // increase wallet balance by amount
    wallet.balance += amount;
    //   if successful, render a deposit successful alert with an okay button that closes the alert
    await wallet.save();
    res.render("deposit-success", { deposit: deposit });
  } catch (error) {
    // handle errors
    console.error(error);
    res.status(500).render("error", { error: "Internal server error" });
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
    // use the user to extract the walletId, then find the wallet using that id
    const wallet = await Wallet.findOne({ userID: user.userID });
    // create a withdrawal object like this
    // { from: this wallet id, amount: amount}
    if (wallet.balance >= amount) {
      const withdraw = {
        from: wallet.accountNumber,
        amount: amount,
      };
      // add this to the withdrawals array of the wallet
      wallet.withdrawals.push(withdraw);
      // increase wallet balance by amount
      wallet.balance -= amount;
      //   if successful, render a deposit successful alert with an okay button that closes the alert
      await wallet.save();
      res.render("deposit-success", { deposit: deposit });
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
