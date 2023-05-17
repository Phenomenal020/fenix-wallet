const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalBalance: {
    // wallet balance
    type: Number,
    default: 0,
  },
  totalDeposits: {
    type: Number,
    default: 0,
  },
  totalWithdrawals: {
    type: Number,
    default: 0,
  },
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
