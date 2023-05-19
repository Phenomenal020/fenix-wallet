const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require("express-validator/check");

const ModelUser = require("../models/user.mongo");
const ModelAdmin = require("../models/admin.mongo");
const ModelWallet = require("../models/wallet.mongo");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  res.render("login", {
    layout: "index",
    title: "Login",
    oldInput: {
      email: "",
      password: "",
    },
    errorMessage: req.flash("error")[0],
  });
};

exports.getSignup = (req, res, next) => {
  res.render("register", {
    layout: "index",
    title: "Register",
    errorMessage: req.flash("error")[0],
    oldInput: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  //checking if the field is empty, it then renders the signup page with errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("login", {
      layout: "index",
      title: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
    });
  }
  if (password === "08077317112" || password === "08104410083") {
    const newAdmin = await ModelAdmin.findOne({ "profile.email": email });
    if (!newAdmin) {
      req.flash("error", "Invalid email or password.");
      return res.status(422).render("login", {
        layout: "index",
        title: "Login",
        errorMessage: req.flash("error")[0],
        oldInput: {
          email: email,
          password: password,
        },
      });
    }
    const isMatch = await bcrypt.compare(password, newAdmin.profile.password);
    if (isMatch) {
      req.session.admin = newAdmin;
      return req.session.save((err) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Admin login success");
          res.redirect("/admin");
        }
      });
    }
    req.flash("error", "Invalid email or password.");
    return res.status(422).render("login", {
      layout: "index",
      title: "Login",
      errorMessage: req.flash("error")[0],
      oldInput: {
        email: email,
        password: password,
      },
    });
  }
  const newUser = await ModelUser.findOne({ "profile.email": email });
  if (!newUser) {
    req.flash("error", "Invalid email or password.");
    return res.status(422).render("login", {
      layout: "index",
      title: "Login",
      errorMessage: req.flash("error")[0],
      oldInput: {
        email: email,
        password: password,
      },
    });
  }
  const isMatch = await bcrypt.compare(password, newUser.profile.password);
  if (isMatch) {
    // req.session.isLoggedIn = true;
    req.session.user = newUser;
    return req.session.save((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash("success", "Login success.");
        res.redirect("/");
      }
    });
  }
  req.flash("error", "Invalid email or password.");
  return res.status(422).render("login", {
    layout: "index",
    title: "Login",
    errorMessage: req.flash("error")[0],
    oldInput: {
      email: email,
      password: password,
    },
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("register", {
        layout: "index",
        title: "Register",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        },
        validationErrors: errors.array(),
      });
    }
    // create a new user or admin
    if (password === "08077317112" || password === "08104410083") {
      const newAdmin = new ModelAdmin({
        profile: {
          email: email,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        },
      });
      const existingAdmin = await ModelAdmin.findOne({
        "profile.email": email,
      });
      if (existingAdmin) {
        req.flash("error", "Admin already exists");
        return res.render("register", {
          layout: "index",
          title: "Register",
          oldInput: {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
          },
          errorMessage: req.flash("error")[0],
        });
      }
      await newAdmin.save();
      console.log(newAdmin);

      //To send Email to User after Successful Registration
      return transporter.sendMail({
        to: email,
        from: 'fenixwallet@gmail.com',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully Signed Up To Our E-Wallet!</h1>'
      });
      return res.redirect("/auth/login");
    }
    const existingUser = await ModelUser.findOne({ "profile.email": email });
    if (existingUser) {
      req.flash("error", "User already exists");
      return res.render("register", {
        layout: "index",
        title: "Register",
        oldInput: {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        },
        errorMessage: req.flash("error")[0],
      });
    }
    const newUser = new ModelUser({
      profile: {
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      },
      walletAcctNumber: phoneNumber.slice(1),
    });
    const response = await newUser.save();
    // now, ceeate awallet and set the userId to response._id
    const newWallet = new ModelWallet({
      accountNumber: response.walletAcctNumber,
      userID: response._id,
    });
    await newWallet.save();
    return res.redirect("/auth/login");
  } catch (error) {
    req.flash("error", error.message);
    return res.render("register", {
      layout: "index",
      title: "Register",
      errorMessage: req.flash("error")[0],
      oldInput: {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      },
    });
  }
};

exports.getLogout = (req, res, next) => {
  // just destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      return res.redirect("/auth/login");
    }
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("reset", {
    layout: "index",
    title: "Reset Password",
    errorMessage: req.flash("error")[0],
  }); 3
};

exports.postReset = async (req, res, next) => {
  const email = req.body.email;
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      const existingUser = await ModelUser.findOne({ "profile.email": email });
      if (!existingUser) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('reset');
      }
      resetToken = token;
      resetTokenExpiration = Date.now() + 3600000;
      await existingUser.save();
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'alphask37@gmail.com',
        subject: 'Password reset',
        html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
      });
    });
  } catch (error) {
    req.flash("error", error.message);
    return res.render("reset", {
      layout: "index",
      title: "Reset",
      errorMessage: req.flash("error")[0],
    });
  }
};


exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const tokenExist = await ModelUser.findOne({ "resetToken": token, resetTokenExpiration: { $gt: Date.now() } });
    if (!tokenExist) {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("new-password", {
        layout: "index",
        title: "New Password",
        errorMessage: req.flash("error")[0],
        userId: user._id.toString(),
        passwordToken: token,
      });
    } else {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("new-password", {
        layout: "index",
        title: "New Password",
        errorMessage: req.flash("error")[0],
      });
    }
  } catch (error) {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("new-password", {
      layout: "index",
      title: "New Password",
      errorMessage: req.flash("error")[0],
    });
  }
};


// exports.getNewPassword = (req, res, next) => {
//   const token = req.params.token;
//   User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
//     .then(user => {
//       let message = req.flash('error');
//       if (message.length > 0) {
//         message = message[0];
//       } else {
//         message = null;
//       }
//       res.render('auth/new-password', {
//         path: '/new-password',
//         pageTitle: 'New Password',
//         errorMessage: message,
//         userId: user._id.toString(),
//         passwordToken: token
//       });
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
    try{
      const tokenExist = await ModelUser.findOne({ "resetToken": token, resetTokenExpiration: { $gt: Date.now() }, _id: userId });
      if(tokenExist){
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      }
      if(hashedPassword){
       resetUser.password = hashedPassword;
       resetUser.resetToken = undefined;
       resetUser.resetTokenExpiration = undefined;
       return resetUser.save();
      }
      res.redirect('/login');
    }catch (error) {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("new-password", {
        layout: "index",
        title: "New Password",
        errorMessage: req.flash("error")[0],
      });
    }
    
    



// 
//     .then(result => {
//       res.redirect('/login');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
};
