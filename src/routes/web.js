const express = require("express");
const router = express.Router();

const {
  getAwake,
  // Thu Chi
  getStartingBalance,
  postStartingBalance,
  postTransactions,
  getTransactions,
  getCountTransactions,
  deleteTransactions,
  // Phiếu Chuyến
  getAllTrips,
  addTrip,
  deleteTrip,
  // Công nợ
  getAllDebts,
  addDebt,
  deleteDebt,
  // lấy tổng
  getAllSummaryDebts,
  getAllSummaryTrips,
} = require("../controllers/homeController");

// API giữ awake
router.get("/", (req, res) => {
  res.send("hello");
});
router.get("/health", getAwake);

// ==== Thu Chi =====

// API lấy giá trị tồn đầu
router.get("/api/starting-balance", getStartingBalance);

// API cập nhật hoặc xóa tồn đầu
router.post("/api/starting-balance", postStartingBalance);

// API thêm giao dịch
router.post("/api/transactions", postTransactions);

// API lấy giao dịch (có phân trang)
router.get("/api/transactions", getTransactions);

// API đếm tổng số giao dịch (hỗ trợ phân trang client)
router.get("/api/transactions/count", getCountTransactions);

// API xóa giao dịch
router.delete("/api/transactions/:id", deleteTransactions);

// ==== Phiếu Chuyến =======

// API lấy tất cả phiếu chuyến
router.get("/api/trips", getAllTrips);

// API lấy tổng chuyển cty còn nợ/đã trả
router.get("/api/trips/summary", getAllSummaryTrips);

// API thêm  phiếu chuyến
router.post("/api/trips", addTrip);

// API xóa phiếu chuyến
router.delete("/api/trips/:id", deleteTrip);

// ==== Công Nợ =======

// API lấy tất cả công nợ
router.get("/api/debts", getAllDebts);

// API lấy tổng công nợ chưa trả/đã trả
router.get("/api/debts/summary", getAllSummaryDebts);

// API thêm công nợ
router.post("/api/debts", addDebt);

// API xóa công nợ
router.delete("/api/debts/:id", deleteDebt);

module.exports = router;
