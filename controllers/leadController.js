const db = require("../config/db");

exports.createLead = async (req, res) => {
  try {
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
      return res.status(400).json({
        message: "first_name and phone are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO leads 
      (first_name, last_name, phone, email, insurance_type, message, consent)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        phone,
        email,
        insurance_type,
        message,
        consent ?? true,
      ]
    );

    res.status(201).json({
      message: "Lead created successfully",
      lead_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM leads ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};