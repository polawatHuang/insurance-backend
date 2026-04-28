const express = require("express");
const router = express.Router();

const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

const { auth, adminOnly } = require("../middleware/auth");
const { uploadIdCard } = require("../middleware/upload");

router.get("/", auth, adminOnly, getLeads);
router.get("/:id", auth, adminOnly, getLeadById);
router.post("/", uploadIdCard.single("id_card_file"), createLead);
router.put("/:id", auth, adminOnly, uploadIdCard.single("id_card_file"), updateLead);
router.delete("/:id", auth, adminOnly, deleteLead);

module.exports = router;