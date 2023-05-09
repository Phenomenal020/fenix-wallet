// #TODO: Mongoose User model with fields:
// profile details: {
//     first name: type string,
//     last name: type string,
//     other names: an array of strings,
//     password: required,
//     email: required
// }
// wallet : type mongodb id (to represent wallet id)

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
    status: {
      type: String,
      required: true,
      default: "user",
    },
  },
  { timestamps: true }
);

const ModelUser = mongoose.model("ModelUser", modelUserSchema);

module.exports = ModelUser;
