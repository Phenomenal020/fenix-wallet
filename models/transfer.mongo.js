const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    }, // from this account
    to: {
      type: String,
      required: true,
    }, // to this account
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

const Transfer = mongoose.model("Transfer", transferSchema);

module.exports = Transfer;
