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
      otherNames: {
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
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  { timestamps: true }
);

const ModelUser = mongoose.model("ModelUser", modelUserSchema);

module.exports = ModelUser;
