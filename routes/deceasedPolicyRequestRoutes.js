const express = require("express");
const router = express.Router();

const { auth, adminOnly } = require("../middleware/auth");
const { uploadDeceasedDocs, uploadResultDocs } = require("../middleware/upload");
const {
  createRequest,
  listRequests,
  getRequest,
  getMyRequests,
  updateRequest,
  deleteRequest,
  uploadResultDocuments,
  deleteResultDocument,
} = require("../controllers/deceasedPolicyRequestController");

// /my must be declared before /:id so Express doesn't treat "my" as an id param
router.get("/my", auth, getMyRequests);

router.get("/", auth, adminOnly, listRequests);
router.get("/:id", auth, adminOnly, getRequest);
router.post("/", auth, uploadDeceasedDocs, createRequest);
router.put("/:id", auth, adminOnly, updateRequest);
router.delete("/:id", auth, adminOnly, deleteRequest);

// Result documents (admin → user)
router.post("/:id/result-documents", auth, adminOnly, uploadResultDocs, uploadResultDocuments);
router.delete("/:id/result-documents/:docId", auth, adminOnly, deleteResultDocument);

module.exports = router;
