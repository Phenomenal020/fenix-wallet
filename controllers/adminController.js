const Wallet = require("../models/wallet.mongo");
const admin = require("../models/admin.mongo");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator/check");

exports.getLogin = (req, res, next) => {
  // check if there are error messages
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // res.render("auth/login", {
  //   path: "/login",
  //   pageTitle: "Login",
  //   errorMessage: message,
  //   oldInput: {
  //     email: "",
  //     password: "",
  //   },  // so the user doesn't type everything all over again
  //   validationErrors: [],
  // });
};

exports.getSignup = (req, res, next) => {
  // check if there are errors
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // res.render("auth/signup", {
  //   path: "/signup",
  //   pageTitle: "Signup",
  //   errorMessage: message,
  //   oldInput: {
  //     email: "",
  //     password: "",
  //     confirmPassword: "",
  //   },  // so the user doesn't have to type everything all over again
  //   validationErrors: [],
  // });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  const newAdmin = await admin.findOne({ email: email });
  if (!newAdmin) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: "Invalid email or password.",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: [],
    });
  }
  const isMatch = await bcrypt.compare(password, newAdmin.password);
  if (isMatch) {
    req.session.admin = newAdmin;
    return req.session.save((err) => {
      console.log(err);
      res.redirect("/");
    });
  } else {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: "Invalid email or password.",
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: [],
    });
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const otherNames = req.body.otherNames;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          otherNames: otherNames,
        },
        validationErrors: errors.array(),
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    // create a new user
    const newAdmin = new admin({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      otherNames: otherNames,
    });
    await newAdmin.save();
    // return transporter.sendMail({
    //   to: email,
    //   from: 'shop@node-complete.com',
    //   subject: 'Signup succeeded!',
    //   html: '<h1>You successfully signed up!</h1>'
    // });
    return res.render("register-success", {
      message: "Admin registered successfully",
    });
  } catch (error) {
    return res.status(500).render("register-error", {
      error: error.message,
    });
  }
};

exports.postLogout = (req, res, next) => {
  // just destroy the session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.postActivateWallet = async (req, res, next) => {
  const user = req.session.user;
  try {
    const userWallet = await Wallet.findOne({ _id: user.walletId });
    userWallet.active = true;
    await userWallet.save();
    res.render("activation-success", {
      wallet: userWallet,
    });
  } catch (error) {
    res.status(500).render("activation-failure", {
      error: error.message,
    });
  }
};

exports.postApproveTransfer = async (req, res, next) => {
  const { transfer } = req.body;
  try {
    const newTransfer = await Wallet.findOne({ _id: transfer._id });
    if (!newTransfer) {
      return res.render("transfer-error", {
        error: "Invalid transfer",
      });
    }
    newTransfer.status = "approved";
    await newTransfer.save();
    return res.render("approve-success", {
      error: "Transfer approved",
    });
  } catch (error) {
    return res.status(500).render("transfer-error", {
      error: error.message,
    });
  }
};
