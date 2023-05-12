// const crypto = require("crypto");

const bcrypt = require("bcryptjs");
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require("express-validator/check");

const ModelUser = require("../models/user.mongo");

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         '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'
//     }
//   })
// );

exports.getLogin = (req, res, next) => {
  // check if there are error messages
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },  // so the user doesn't type everything all over again
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
    // check if there are errors
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },  // so the user doesn't have to type everything all over again
    validationErrors: [],
  });
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
  const newUser = await ModelUser.findOne({ email: email });
  if (!newUser) {
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
  const isMatch = await bcrypt.compare(password, newUser.password);
  if (isMatch) {
    req.session.user = newUser;
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
    const newUser = new ModelUser({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      otherNames: otherNames,
    });
    await newUser.save();
    // return transporter.sendMail({
    //   to: email,
    //   from: 'shop@node-complete.com',
    //   subject: 'Signup succeeded!',
    //   html: '<h1>You successfully signed up!</h1>'
    // });
    return res.render("register-success", {
      message: "User registered successfully",
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

// exports.getReset = (req, res, next) => {
//   let message = req.flash('error');
//   if (message.length > 0) {
//     message = message[0];
//   } else {
//     message = null;
//   }
//   res.render('auth/reset', {
//     path: '/reset',
//     pageTitle: 'Reset Password',
//     errorMessage: message
//   });
// };

// exports.postReset = (req, res, next) => {
//   crypto.randomBytes(32, (err, buffer) => {
//     if (err) {
//       console.log(err);
//       return res.redirect('/reset');
//     }
//     const token = buffer.toString('hex');
//     User.findOne({ email: req.body.email })
//       .then(user => {
//         if (!user) {
//           req.flash('error', 'No account with that email found.');
//           return res.redirect('/reset');
//         }
//         user.resetToken = token;
//         user.resetTokenExpiration = Date.now() + 3600000;
//         return user.save();
//       })
//       .then(result => {
//         res.redirect('/');
//         transporter.sendMail({
//           to: req.body.email,
//           from: 'shop@node-complete.com',
//           subject: 'Password reset',
//           html: `
//             <p>You requested a password reset</p>
//             <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
//           `
//         });
//       })
//       .catch(err => {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//       });
//   });
// };

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

// exports.postNewPassword = (req, res, next) => {
//   const newPassword = req.body.password;
//   const userId = req.body.userId;
//   const passwordToken = req.body.passwordToken;
//   let resetUser;

//   User.findOne({
//     resetToken: passwordToken,
//     resetTokenExpiration: { $gt: Date.now() },
//     _id: userId
//   })
//     .then(user => {
//       resetUser = user;
//       return bcrypt.hash(newPassword, 12);
//     })
//     .then(hashedPassword => {
//       resetUser.password = hashedPassword;
//       resetUser.resetToken = undefined;
//       resetUser.resetTokenExpiration = undefined;
//       return resetUser.save();
//     })
//     .then(result => {
//       res.redirect('/login');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };
