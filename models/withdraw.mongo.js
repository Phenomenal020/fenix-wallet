const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    from: {
      type: String,
      required: true,
    }, // from this wallet basically
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "Withdrawal",
    },
    status: {
      type: "String",
      default: "Completed",
    },
  },
  { timestamps: true }
);

const withdrawModel = mongoose.model("Withdraw", withdrawSchema);

module.exports = withdrawModel;
