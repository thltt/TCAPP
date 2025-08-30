require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  port: process.env.MYSQL_ADDON_PORT || 3306,
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  ssl: {
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  multipleStatements: true,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 20000,
});

// Khi pool tạo connection mới -> set timeout ngắn
pool.on("connection", async (connection) => {
  const conn = connection.promise();
  try {
    await conn.query("SET SESSION wait_timeout=60");
    await conn.query("SET SESSION interactive_timeout=60");
  } catch (err) {
    console.error("❌ Lỗi khi set wait_timeout:", err.message);
  }
});

// Kiểm tra kết nối
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Đã kết nối MySQL qua pool!");
    connection.release();
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    process.exit(1);
  }
})();

module.exports = pool;
