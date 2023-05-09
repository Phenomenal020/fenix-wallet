const Wallet = require("../models/wallet.mongo");

exports.postWallet = async (req, res, next) => {
  const { type } = req.body;
  const user = req.session.user;
  try {
    const userWallet = await Wallet.findOne({ _id: user.walletId });
    if (type === "activate") {
      userWallet.active = true;
    } else {
      userWallet.active = false;
    }
    await userWallet.save();
    res.render("activation-success", {
      wallet: userWallet,
    });
  } catch (error) {
    res.status(500).render * "error",
      {
        error: error.message,
      };
  }
};

// exports.postApproveTransfer = async (req, res, next) => {
//   const { amount } = req.body;
//   const user = req.session.user;
//   try {
//     const userWallet = await Wallet.findOne({ _id: user.walletId });
//     if (type === "activate") {
//       userWallet.active = true;
//     } else {
//       userWallet.active = false;
//     }
//     await userWallet.save();
//     res.render("activation-success", {
//       wallet: userWallet,
//     });
//   } catch (error) {
//     res.status(500).render * "error",
//       {
//         error: error.message,
//       };
//   }
// };
