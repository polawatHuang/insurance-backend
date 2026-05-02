const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// POST /api/deceased-policy-requests — any authenticated user
exports.createRequest = async (req, res) => {
  const userId = req.user?.id || null;

  const [result] = await db.query(
    "INSERT INTO deceased_policy_requests (user_id, status) VALUES (?, 'pending')",
    [userId]
  );
  const requestId = result.insertId;

  if (req.files && req.files.length > 0) {
    const docValues = req.files.map((file) => [
      requestId,
      file.fieldname,
      `/uploads/deceased-docs/${file.filename}`,
    ]);
    await db.query(
      "INSERT INTO deceased_policy_request_documents (request_id, label, path) VALUES ?",
      [docValues]
    );
  }

  res.status(201).json({ message: "คำร้องส่งเรียบร้อยแล้ว", id: requestId });
};

// GET /api/deceased-policy-requests — admin only
exports.listRequests = async (req, res) => {
  const [rows] = await db.query(`
    SELECT r.id, r.user_id, r.status, r.admin_note, r.created_at, r.updated_at,
           u.first_name, u.last_name, u.email
    FROM deceased_policy_requests r
    LEFT JOIN users u ON r.user_id = u.id
    ORDER BY r.id DESC
  `);

  const requests = rows.map((row) => ({
    id: row.id,
    status: row.status,
    admin_note: row.admin_note,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
    },
  }));

  res.json(requests);
};

// GET /api/deceased-policy-requests/my — current user's own requests
exports.getMyRequests = async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    "SELECT * FROM deceased_policy_requests WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );

  if (rows.length === 0) {
    return res.json([]);
  }

  const requestIds = rows.map((r) => r.id);
  const [docs] = await db.query(
    "SELECT * FROM deceased_policy_request_documents WHERE request_id IN (?)",
    [requestIds]
  );
  const [resultDocs] = await db.query(
    "SELECT * FROM deceased_policy_result_documents WHERE request_id IN (?)",
    [requestIds]
  );

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const requests = rows.map((row) => ({
    id: row.id,
    status: row.status,
    admin_note: row.admin_note,
    created_at: row.created_at,
    updated_at: row.updated_at,
    documents: docs
      .filter((d) => d.request_id === row.id)
      .map((doc) => ({
        id: doc.id,
        name: doc.label,
        label: doc.label,
        path: doc.path,
        url: `${baseUrl}${doc.path}`,
      })),
    result_documents: resultDocs
      .filter((d) => d.request_id === row.id)
      .map((doc) => ({
        id: doc.id,
        label: doc.label,
        path: doc.path,
        url: `${baseUrl}${doc.path}`,
      })),
  }));

  res.json(requests);
};

// GET /api/deceased-policy-requests/:id — admin only
exports.getRequest = async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    `SELECT r.*, u.first_name, u.last_name, u.email
     FROM deceased_policy_requests r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Request not found" });
  }

  const row = rows[0];
  const [docs] = await db.query(
    "SELECT * FROM deceased_policy_request_documents WHERE request_id = ?",
    [id]
  );
  const [resultDocs] = await db.query(
    "SELECT * FROM deceased_policy_result_documents WHERE request_id = ? ORDER BY id ASC",
    [id]
  );

  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({
    data: {
      id: row.id,
      status: row.status,
      admin_note: row.admin_note,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
      },
      documents: docs.map((doc) => ({
        id: doc.id,
        name: doc.label,
        label: doc.label,
        path: doc.path,
        url: `${baseUrl}${doc.path}`,
      })),
      result_documents: resultDocs.map((doc) => ({
        id: doc.id,
        label: doc.label,
        path: doc.path,
        url: `${baseUrl}${doc.path}`,
      })),
    },
  });
};

// PUT /api/deceased-policy-requests/:id — admin only
exports.updateRequest = async (req, res) => {
  const { id } = req.params;
  const { status, admin_note } = req.body;

  const [existing] = await db.query(
    "SELECT id FROM deceased_policy_requests WHERE id = ?",
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: "Request not found" });
  }

  await db.query(
    "UPDATE deceased_policy_requests SET status = ?, admin_note = ? WHERE id = ?",
    [status, admin_note ?? null, id]
  );

  res.json({ message: "อัปเดตสำเร็จ" });
};

// POST /api/deceased-policy-requests/:id/result-documents — admin only
exports.uploadResultDocuments = async (req, res) => {
  const { id } = req.params;

  const [existing] = await db.query(
    "SELECT id FROM deceased_policy_requests WHERE id = ?",
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์" });
  }

  const docValues = req.files.map((file) => [
    id,
    file.originalname,
    `/uploads/result-docs/${file.filename}`,
  ]);

  await db.query(
    "INSERT INTO deceased_policy_result_documents (request_id, label, path) VALUES ?",
    [docValues]
  );

  res.status(201).json({ message: "อัปโหลดเรียบร้อย", count: req.files.length });
};

// DELETE /api/deceased-policy-requests/:id/result-documents/:docId — admin only
exports.deleteResultDocument = async (req, res) => {
  const { id, docId } = req.params;

  const [existing] = await db.query(
    "SELECT * FROM deceased_policy_result_documents WHERE id = ? AND request_id = ?",
    [docId, id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: "Document not found" });
  }

  const fullPath = path.join(__dirname, "../", existing[0].path);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  await db.query("DELETE FROM deceased_policy_result_documents WHERE id = ?", [docId]);

  res.json({ message: "ลบเรียบร้อย" });
};

// DELETE /api/deceased-policy-requests/:id — admin only
exports.deleteRequest = async (req, res) => {
  const { id } = req.params;

  const [existing] = await db.query(
    "SELECT id FROM deceased_policy_requests WHERE id = ?",
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: "Request not found" });
  }

  // Child documents are cascade-deleted by the FK constraint
  await db.query("DELETE FROM deceased_policy_requests WHERE id = ?", [id]);

  res.json({ message: "ลบสำเร็จ" });
};
