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
    status: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const admin = mongoose.model("ModelAdmin", adminSchema);

module.exports = admin;
