const mongoose = require("mongoose");

const modelUserSchema = new mongoose.Schema(
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
      password: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
      },
    },
    walletAcctNumber: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

const ModelUser = mongoose.model("ModelUser", modelUserSchema);

module.exports = ModelUser;
