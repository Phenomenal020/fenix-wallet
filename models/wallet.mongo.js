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
  active: {
    type: Boolean,
    default: false,
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
  // pendingBal: [{ type: number }],
  // transfers: [
  //   {
  //     from: {
  //       type: Schema.Types.ObjectId,
  //       ref: "Wallet",
  //       required: true,
  //     }, // from this wallet
  //     to: {
  //       type: Schema.Types.ObjectId,
  //       ref: "Wallet",
  //       required: true,
  //     }, // to this wallet
  //     amount: {
  //       type: Number,
  //       required: true,
  //     },
  //     status: {
  //       type: String,
  //       // enum: ["pending", "approved", "declined"],
  //       default: "pending",
  //     },
  //   },
  // ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
