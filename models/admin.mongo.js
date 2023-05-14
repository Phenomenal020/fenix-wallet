const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    profile: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      otherNames: {
        type: String,
      },
      password: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
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
    //       enum: ["pending", "approved", "declined"],
    //       default: "pending",
    //     },
    //   },
    // ],
    status: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const admin = mongoose.model("ModelAdmin", adminSchema);

module.exports = admin;
