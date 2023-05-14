const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  fromWallet: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  //   fromAccount: {
  //     type: String,
  //     ref: "Wallet",
  //     required: true,
  //   }, // from this wallet basically
  amount: {
    type: Number,
    required: true,
  },
});

const withdrawModel = mongoose.model("Wallet", withdrawSchema);

module.exports = withdrawModel;