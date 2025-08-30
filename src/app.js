const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const webRouter = require("./routes/web");
app.use("/", webRouter); //goi route

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error("❌ Lỗi:", err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
