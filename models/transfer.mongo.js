const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    fromWallet: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }, // from this account
    toWallet: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }, // to this account
    // fromAccount: {
    //   type: String,
    //   required: true,
    // }, // from this account
    // toAccount: {
    //   type: String,
    //   required: true,
    // }, // to this account
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const transferModel = mongoose.model("Transfer", transferSchema);

module.exports = transferModel;
