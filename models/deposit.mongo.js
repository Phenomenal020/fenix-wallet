const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  toWallet: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  }, 
  //   toAccount: {
  //     type: String,
  //     ref: "Wallet",
  //     required: true,
  //   }, // from this wallet basically
  amount: {
    type: Number,
    required: true,
  },
});

const depositModel = mongoose.model("deposit", depositSchema);

module.exports = depositModel;
