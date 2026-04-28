require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "BestInsur API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});