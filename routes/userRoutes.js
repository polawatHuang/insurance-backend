const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, adminOnly, getUsers);
router.get("/:id", auth, adminOnly, getUserById);
router.post("/", auth, adminOnly, createUser);
router.put("/:id", auth, adminOnly, updateUser);
router.delete("/:id", auth, adminOnly, deleteUser);

module.exports = router;