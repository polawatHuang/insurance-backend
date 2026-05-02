const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/ids");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, WEBP, PDF files are allowed"), false);
  }

  cb(null, true);
};

exports.uploadIdCard = multer({
  storage,
  fileFilter,
});

// ── Deceased policy request documents ──────────────────────────────────────
const docsUploadDir = path.join(__dirname, "../uploads/deceased-docs");

if (!fs.existsSync(docsUploadDir)) {
  fs.mkdirSync(docsUploadDir, { recursive: true });
}

const docsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

exports.uploadDeceasedDocs = multer({
  storage: docsStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
}).any();