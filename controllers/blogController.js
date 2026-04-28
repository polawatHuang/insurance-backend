const db = require("../config/db");

function createSlug(title) {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "");
}

exports.getBlogs = async (req, res) => {
  const { category, status } = req.query;

  let sql = "SELECT * FROM blogs WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY id DESC";

  const [rows] = await db.query(sql, params);
  res.json(rows);
};

exports.getBlogById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM blogs WHERE id = ?", [
    req.params.id,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }

  res.json(rows[0]);
};

exports.getBlogBySlug = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM blogs WHERE slug = ?", [
    req.params.slug,
  ]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }

  res.json(rows[0]);
};

exports.createBlog = async (req, res) => {
  const { title, category, excerpt, content, image, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const slug = createSlug(title);

  const [result] = await db.query(
    `INSERT INTO blogs (title, slug, category, excerpt, content, image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, category, excerpt, content, image, status || "draft"]
  );

  res.status(201).json({
    message: "Blog created",
    id: result.insertId,
    slug,
  });
};

exports.updateBlog = async (req, res) => {
  const { title, category, excerpt, content, image, status } = req.body;

  const slug = title ? createSlug(title) : undefined;

  await db.query(
    `UPDATE blogs 
     SET title=?, slug=?, category=?, excerpt=?, content=?, image=?, status=?
     WHERE id=?`,
    [title, slug, category, excerpt, content, image, status || "draft", req.params.id]
  );

  res.json({ message: "Blog updated" });
};

exports.deleteBlog = async (req, res) => {
  await db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);

  res.json({ message: "Blog deleted" });
};