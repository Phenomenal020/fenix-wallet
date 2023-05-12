const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

// require express-handlebars
const handleBars = require("express-handlebars");

// require node js path module for directory/file navigation
const path = require("path");

require("dotenv").config();

// const errorController = require('./controllers/error');

// Set the views directory using path.dirname
const viewsPath = path.join(__dirname, "views");

// Quick Tutorial: What if the views folder was located 4 folders above app.js
// const viewsPath = path.join(__dirname, '../../../../../views');

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

// register your view engine - handlebars
app.engine(
  "hbs",
  handleBars({
    layoutsDir: viewsPath,
    extname: "hbs",
    defaultLayout: "main", // Specify the main layout file (main.hbs)
    layoutsDir: viewsPath + "/layouts", // Specify the directory for layout files
    partialsDir: viewsPath + "/partials", // Specify the directory for partials
  })
);
app.set("view engine", "hbs");
app.set("views", viewsPath);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "phenomenal",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.get("/deposit", (req, res) => {
  res.render("deposit", {
    title: "Deposit",
  });
});

app.get("/withdraw", (req, res) => {
  res.render("withdraw", {
    title: "Withdraw",
  });
});

app.get("/transfer", (req, res) => {
  res.render("transfer", {
    title: "Transfer",
  });
});

app.get("/profile", (req, res) => {
  res.render("view-profile", {
    layout: "profile",
    title: "Profile",
  });
});

app.get("/", (req, res) => {
  res.render("home", { title: "Dashboard" });
});

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

// app.use((req, res, next) => {
//   // throw new Error('Sync Dummy');
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       if (!user) {
//         return next();
//       }
//       req.user = user;
//       next();
//     })
//     .catch(err => {
//       next(new Error(err));
//     });
// });

// app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
// });

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT);
    console.log(`listening on PORT ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log(err);
  });
