const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    transferString: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "Transfer",
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
