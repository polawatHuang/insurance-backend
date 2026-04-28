const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { auth, adminOnly } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

router.post("/", auth, adminOnly, createProduct);
router.put("/:id", auth, adminOnly, updateProduct);
router.delete("/:id", auth, adminOnly, deleteProduct);

module.exports = router;