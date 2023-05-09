// #TODO: Mongoose Wallet model with fields:
// userID : type mongodb id (to represent user model _id)
// active: boolean showing whether this wallet has been activated or not
// deposits: {
//         from: type mongodb id for wallet id (this wallet),
//         amount: type number,
//     }
//     withdrawals: {
//         to: type mongodb id for wallet id (another wallet),
//         amount: type number,
//     }
//     transfers: {
//         from: type mongodb id for wallet id (this wallet),
//         to: type mongodb id for wallet id (abother wallet),
//         amount: type number,
//         status: type pending/approved/declined
//     }

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  deposits: [
    {
      to: {
        type: Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
      }, // to this wallet basically
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  withdrawals: [
    {
      from: {
        type: Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
      }, // from this wallet basically
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  transfers: [
    {
      from: {
        type: Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
      }, // from this wallet
      to: {
        type: Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
      }, // to this wallet
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending",
      },
    },
  ],
  balance: {
    // wallet balance
    type: number,
    ref: "ModelUser",
    default: 0,
  },
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
