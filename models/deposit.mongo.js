const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  to: {
    type: String,
    ref: "Wallet",
    required: true,
  }, // from this wallet basically
  amount: {
    type: Number,
    required: true,
  },
});

const depositModel = mongoose.model("Deposit", depositSchema);

module.exports = depositModel;
