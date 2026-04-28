require("dotenv").config();
const mysql = require("mysql2/promise");

async function testDB() {
  console.log("🔍 Testing database connection...");

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connected to MySQL successfully!");

    // test query
    const [rows] = await connection.query("SELECT NOW() AS now");

    console.log("📅 DB Time:", rows[0].now);

    // test table (optional)
    const [tables] = await connection.query("SHOW TABLES");

    console.log("📦 Tables:");
    console.table(tables);

    await connection.end();

    console.log("🔌 Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(error.message);
    process.exit(1);
  }
}

testDB();