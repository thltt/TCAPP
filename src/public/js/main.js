const API_SUM_DEBTS = "https://tcapp-pearl.vercel.app/api/debts/summary";
const API_SUM_TRIPS = "https://tcapp-pearl.vercel.app/api/trips/summary";

let tripsSummary = null;
let debtsSummary = null;

function updateDiffer() {
  if (tripsSummary && debtsSummary) {
    const differ = Number(tripsSummary.cty_no) - Number(debtsSummary.tong_no);
    document.getElementById("total_differ").textContent = differ.toLocaleString("vi-VN") + " VNĐ";
  }
}

async function fetchSummaryTrips() {
  try {
    const res = await fetch(API_SUM_TRIPS);
    if (!res.ok) throw new Error("Lỗi lấy dữ liệu");

    const data = await res.json();

    if (data.length > 0) {
      tripsSummary = data[0];

      document.getElementById("company_not_pay").textContent = Number(tripsSummary.cty_no).toLocaleString("vi-VN") + " VNĐ";
      document.getElementById("company_payed").textContent = Number(tripsSummary.cty_tra).toLocaleString("vi-VN") + " VNĐ";
      document.getElementById("phieuchuyen_remain").textContent =
        (Number(tripsSummary.cty_no) - Number(tripsSummary.cty_tra)).toLocaleString("vi-VN") + " VNĐ";

      updateDiffer();
    }
  } catch (err) {
    console.error(err);
  }
}

async function fetchSummaryDebts() {
  try {
    const res = await fetch(API_SUM_DEBTS);
    if (!res.ok) throw new Error("Lỗi lấy dữ liệu");

    const data = await res.json();

    if (data.length > 0) {
      debtsSummary = data[0]; // lưu object vào biến toàn cục

      document.getElementById("debt_must_pay").textContent = Number(debtsSummary.tong_no).toLocaleString("vi-VN") + " VNĐ";
      document.getElementById("debt_payed").textContent = Number(debtsSummary.tong_da_tra).toLocaleString("vi-VN") + " VNĐ";
      document.getElementById("congno_remain").textContent =
        (Number(debtsSummary.tong_no) - Number(debtsSummary.tong_da_tra)).toLocaleString("vi-VN") + " VNĐ";

      updateDiffer();
    }
  } catch (err) {
    console.error(err);
  }
}

function refreshData() {
  fetchSummaryTrips();
  fetchSummaryDebts();
}
refreshData();
setInterval(refreshData, 600000);
