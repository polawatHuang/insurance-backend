require("dotenv").config();

const allowedOrigins = [
  "https://*.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3306",
];

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const productRoutes = require("./routes/productRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow request ที่ไม่มี origin (เช่น postman)
      if (!origin) return callback(null, true);

      // allow localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ allow ทุก *.vercel.app
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.options("*", cors()); // enable pre-flight for all routes

app.use(express.json({ limit: "1000mb" }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 10000,
    max: 3000,
    message: {
      message: "Too many requests, please try again later.",
    },
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "BestInsur API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});