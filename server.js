const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8050;

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  port: process.env.MYSQL_ADDON_PORT || 3306,
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    process.exit(1);
  }
  console.log("✅ Đã kết nối MySQL qua pool!");
  connection.release();
});

// API lấy giá trị tồn đầu
app.get("/api/starting-balance", (req, res) => {
  pool.query("SELECT starting_balance FROM settings WHERE id = 1", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ starting_balance: rows[0].starting_balance });
  });
});

// API cập nhật và xóa tồn đầu
app.post("/api/starting-balance", (req, res) => {
  const sql = "UPDATE settings SET starting_balance = 0 WHERE id = 1";
  pool.query(sql, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Xóa tồn đầu thành công." });
  });
});

// API thêm giao dịch
app.post("/api/transactions", (req, res) => {
  const { date, name, type, amount, category, note } = req.body;
  const sql = `INSERT INTO transactions (date, name, type, amount, category, note) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  pool.query(sql, [date, name, type, amount, category, note], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId });
  });
});

// API lấy giao dịch (có phân trang)
app.get("/api/transactions", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  // const sql = "SELECT * FROM transactions ORDER BY date DESC LIMIT ? OFFSET ?";
  const sql = "SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT ? OFFSET ?";

  pool.query(sql, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

// API đếm tổng số giao dịch (hỗ trợ phân trang client)
app.get("/api/transactions/count", (req, res) => {
  pool.query("SELECT COUNT(*) as total FROM transactions", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ total: result[0].total });
  });
});

// API xóa giao dịch
app.delete("/api/transactions/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM transactions WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Không tìm thấy giao dịch để xóa." });
    } else {
      res.json({ message: "Đã xóa thành công." });
    }
  });
});

// giữ awake
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    time: new Date(),
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
