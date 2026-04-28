const express = require("express");
const router = express.Router();

const {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const { auth, adminOnly } = require("../middleware/auth");

router.get("/", getBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);
router.post("/", auth, adminOnly, createBlog);
router.put("/:id", auth, adminOnly, updateBlog);
router.delete("/:id", auth, adminOnly, deleteBlog);

module.exports = router;