const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh_token", authController.refresh_token);
router.post("/forgot-password", authController.mailForgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google-login", authController.loginByGoogle);
router.post("/facebook-login", authController.loginByFacebook);

module.exports = router;
