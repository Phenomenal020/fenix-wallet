// Core dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");

const app = express();

// To suppress handlebars control prototype access:
const handleBars = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");

// for directory navigation
const path = require("path");

// for environment variables
require("dotenv").config();

// routers
const authRouter = require("./routes/authRouter");
const actionsRouter = require("./routes/actionsRouter");
const adminRouter = require("./routes/adminRouter");

// Protect the home/dashboard route by making sure only logged in users can access it
const { requireAuth } = require("./middleware/is-auth");

// For the home route to display wallet information of logged in users
const Wallet = require("./models/wallet.mongo");

// path to the views folder
const viewsPath = path.join(__dirname, "views");
const uploadPath = path.join(__dirname, "public", "uploads");

// set up express session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

// register your view engine - handlebars
// Set the view engine to use Handlebars
// configure the default layout to use main
// configure the engine to use "hbs" as extension name instead of "handlebars"
// set up the partials' directory
// use allowInsecurePrototypeAccess to suppress control prototype access warning
app.engine(
  "hbs",
  handleBars({
    extname: "hbs",
    defaultLayout: "main", // Specify the main layout file (main.hbs)
    layoutsDir: viewsPath + "/layouts", // Specify the directory for layout files
    partialsDir: viewsPath + "/partials", // Specify the directory for partials
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "hbs");
app.set("views", viewsPath);

// Set up Multer storage
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  // Generate a unique filename with timestamps in the beginning
  filename: function (req, file, cb) {
    // Generate a unique filename
    // const timestamp = new Date().toISOString();
    const filename = file.originalname;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// set up body parser for form data
app.use(bodyParser.urlencoded({ extended: false }));

// set up express public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// use the session middleware
app.use(
  session({
    secret: "phenomenal",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// flash middleware for error handling
app.use(flash());

// use the routers - home, auth, actions, and admin
app.use("/auth", authRouter);
app.use("/actions", actionsRouter);
app.use("/admin", adminRouter);

app.get("/", requireAuth, async (req, res) => {
  const wallet = await Wallet.findOne({ userID: req.session.user._id });
  res.render("home", {
    title: "Dashboard",
    successMsg: req.flash("success")[0],
    firstName: req.session ? req.session.user.profile.firstName : "",
    totalBalance: wallet.totalBalance,
    totalDeposits: wallet.totalDeposits,
    totalWithdrawals: wallet.totalWithdrawals,
  });
});

// connect to mongoose and setup your server
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
