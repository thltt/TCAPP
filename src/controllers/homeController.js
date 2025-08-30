const pool = require("../config/database");

const {
  // Thu Chi
  getAmountStartingBalance,
  updateStartingBalance,
  addTransaction,
  getTransactionsList,
  countTransactions,
  deleteTransaction,
  // Phiếu Chuyến
  getTrips,
  insertTrip,
  removeTrip,
  // Công nợ
  getDebts,
  insertDebt,
  removeDebt,
  // lấy tổng
  getSummaryDebts,
  getSummaryTrips,
} = require("../services/CRUD");

// Controller giữ awake
const getAwake = (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), time: new Date() });
};

// ===== Thu Chi =====

// Controller lấy giá trị tồn đầu Thu Chi
const getStartingBalance = async (req, res) => {
  const result = await getAmountStartingBalance();
  res.json({ starting_balance: result.starting_balance });
};

// Controller cập nhật hoặc xóa tồn đầu Thu Chi
const postStartingBalance = async (req, res) => {
  console.log("Body nhận được:", req.body);
  const { starting_balance } = req.body;
  const result = await updateStartingBalance(starting_balance);
  res.json({ message: "Chỉnh sửa tồn đầu thành công.", result });
};

// Controller thêm giao dịch Thu Chi
const postTransactions = async (req, res) => {
  const id = await addTransaction(req.body);
  res.json({ message: "Thêm thành công", id });
};

// Controller lấy giao dịch (có phân trang) Thu Chi
const getTransactions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const rows = await getTransactionsList(limit, offset);
  res.json(rows);
};

// Controller đếm tổng số giao dịch (hỗ trợ phân trang client) Thu Chi
const getCountTransactions = async (req, res) => {
  const total = await countTransactions();
  res.json({ total });
};

// Controller xóa giao dịch Thu Chi
const deleteTransactions = async (req, res) => {
  const id = req.params.id;
  const affected = await deleteTransaction(id);
  if (affected === 0) {
    res.status(404).json({ message: "Không tìm thấy giao dịch để xóa." });
  } else {
    res.json({ message: "Đã xóa thành công." });
  }
};

// ===== Phiếu chuyến =====

// Lấy tất cả phiếu chuyến
const getAllTrips = async (req, res) => {
  const rows = await getTrips();
  res.json(rows);
};

// lấy tổng phiếu chuyến
const getAllSummaryTrips = async (req, res) => {
  const summary = await getSummaryTrips();
  res.json(summary);
};

// Thêm Phiếu chuyến
const addTrip = async (req, res) => {
  const id = await insertTrip(req.body);
  res.json({ message: "Thêm thành công", id });
};

// Xóa Phiếu chuyến
const deleteTrip = async (req, res) => {
  const { id } = req.params;
  const affected = await removeTrip(id);
  res.status(affected === 0 ? 404 : 200).json({
    message: affected === 0 ? "Không tìm thấy phiếu chuyến để xóa." : "Xóa thành công",
  });
};

// ===== Công nợ =====

// lấy tất cả công nợ
const getAllDebts = async (req, res) => {
  const rows = await getDebts();
  res.json(rows);
};

// lấy tổng công nợ
const getAllSummaryDebts = async (req, res) => {
  const summary = await getSummaryDebts();
  res.json(summary);
};

// thêm công nợ
const addDebt = async (req, res) => {
  const id = await insertDebt(req.body);
  res.json({ message: "Thêm thành công", id });
};

// xóa công nợ
const deleteDebt = async (req, res) => {
  const { id } = req.params;
  const affected = await removeDebt(id);
  res.status(affected === 0 ? 404 : 200).json({
    message: affected === 0 ? "Không tìm thấy công nợ để xóa." : "Xóa thành công",
  });
};
module.exports = {
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
};
