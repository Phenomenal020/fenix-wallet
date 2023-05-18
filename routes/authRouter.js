const express = require("express");
const { check, body } = require("express-validator/check");

const authController = require("../controllers/authController");
const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/register", authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("phoneNumber", "Phone number must be 11 digit numbers").matches(
      /^\d{11}$/
    ),
  ],
  authController.postSignup
);

router.get("/logout", authController.getLogout);

module.exports = router;
