const db = require("../config/db");

exports.getLeads = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM leads ORDER BY id DESC");
  res.json(rows);
};

exports.getLeadById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM leads WHERE id = ?", [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Lead not found" });
  }

  res.json(rows[0]);
};

exports.createLead = async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    insurance_type,
    message,
    consent,
  } = req.body;

  if (!first_name || !phone) {
    return res.status(400).json({ message: "first_name and phone are required" });
  }

  const idCardPath = req.file ? `/uploads/ids/${req.file.filename}` : null;

  const [result] = await db.query(
    `INSERT INTO leads 
    (first_name, last_name, phone, email, insurance_type, message, consent, id_card_file)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      phone,
      email,
      insurance_type,
      message,
      consent ?? true,
      idCardPath,
    ]
  );

  res.status(201).json({
    message: "Lead created",
    id: result.insertId,
    id_card_file: idCardPath,
  });
};

exports.updateLead = async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    email,
    insurance_type,
    message,
    consent,
    status,
  } = req.body;

  const [oldRows] = await db.query("SELECT * FROM leads WHERE id = ?", [
    req.params.id,
  ]);

  if (oldRows.length === 0) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const oldLead = oldRows[0];
  const idCardPath = req.file
    ? `/uploads/ids/${req.file.filename}`
    : oldLead.id_card_file;

  await db.query(
    `UPDATE leads 
     SET first_name=?, last_name=?, phone=?, email=?, insurance_type=?, message=?, consent=?, status=?, id_card_file=?
     WHERE id=?`,
    [
      first_name,
      last_name,
      phone,
      email,
      insurance_type,
      message,
      consent ?? true,
      status || oldLead.status,
      idCardPath,
      req.params.id,
    ]
  );

  res.json({ message: "Lead updated" });
};

exports.deleteLead = async (req, res) => {
  await db.query("DELETE FROM leads WHERE id = ?", [req.params.id]);

  res.json({ message: "Lead deleted" });
};