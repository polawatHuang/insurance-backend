const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.getUsers = async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY id DESC"
  );

  res.json(rows);
};

exports.getUserById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?",
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(rows[0]);
};

exports.createUser = async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    `INSERT INTO users (first_name, last_name, email, phone, password, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, hashedPassword, role || "user"]
  );

  res.status(201).json({ message: "User created", id: result.insertId });
};

exports.updateUser = async (req, res) => {
  const { first_name, last_name, email, phone, role, password } = req.body;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users 
       SET first_name=?, last_name=?, email=?, phone=?, role=?, password=?
       WHERE id=?`,
      [first_name, last_name, email, phone, role, hashedPassword, req.params.id]
    );
  } else {
    await db.query(
      `UPDATE users 
       SET first_name=?, last_name=?, email=?, phone=?, role=?
       WHERE id=?`,
      [first_name, last_name, email, phone, role, req.params.id]
    );
  }

  res.json({ message: "User updated" });
};

exports.deleteUser = async (req, res) => {
  await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);

  res.json({ message: "User deleted" });
};