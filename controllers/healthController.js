const db = require("../config/db");

exports.healthCheck = async (req, res) => {
  const startTime = Date.now();

  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      api: "ok",
      database: "unknown",
    },
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
    responseTime: null,
  };

  try {
    // ✅ check DB connection
    await db.query("SELECT 1");

    health.services.database = "ok";
  } catch (error) {
    health.status = "error";
    health.services.database = "down";
    health.error = error.message;

    return res.status(500).json(health);
  }

  // response time
  health.responseTime = `${Date.now() - startTime}ms`;

  res.json(health);
};