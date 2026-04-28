const db = require("../config/db");

exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let sql = "SELECT * FROM products";
    const params = [];

    if (category) {
      sql += " WHERE category = ?";
      params.push(category);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, category, description, price, tag } = req.body;

    const [result] = await db.query(
      `INSERT INTO products 
      (title, category, description, price, tag)
      VALUES (?, ?, ?, ?, ?)`,
      [title, category, description, price, tag]
    );

    res.status(201).json({
      message: "Product created successfully",
      product_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};