const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { auth } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", auth, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;