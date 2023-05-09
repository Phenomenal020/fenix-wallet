const ModelUser = require("../models/user.mongo");
const Wallet = require("../models/wallet.mongo");

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
    const { amount } = req.body;
    // get the email or account number from the body
    const accountNumber = req.body.accountNumber
      ? req.body.accountNumber
      : null;
    const email = req.body.email ? req.body.email : null;
    // get the user from the req session
    const user = req.session.user;
    // use the user to extract the walletId, then find the wallet using that id
    const userWallet = await Wallet.findOne({ userID: user.userID });
    // use the field from req.body to find the user and extract the walletId, then find the wallet using that id
    let recipientWallet = {};
    let recipientUser = {};
    if (accountNumber) {
      recipientWallet = await Wallet.findOne({ accountNumber: accountNumber }); // add other fields later
    } else {
      recipientUser = await ModelUser.findOne({ email: email }); // add other fields later
      if (!recipientUser) {
        req.flash.error("error", "No such user in the database");
        // do more
      } else {
        recipientWallet = await Wallet.findOne({ _id: recipientUser.walletId });
      }
    }
    // create a transfer object like this
    // { from: this wallet id,to: receipent wallet, amount: amount}
    if (userWallet.balance >= amount) {
      const transfer = {
        from: userWallet.accountNumber,
        to: recipientWallet.accountNumber,
        amount: amount,
      };
      // add this to the transfers array of the wallet
      userWallet.transfers.push(transfer);
      // decrease wallet balance by amount
      //   REMAINING: Send approval request to control with the transfer details
      //   await wallet.save();
      res.render("transfer-pending");
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
