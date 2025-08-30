const API_TRIPS = "https://tcapp-pearl.vercel.app/api/trips";

// Load danh sách phiếu chuyến khi mở trang
window.onload = () => {
  fetchTrips();
  setupTinhTrangListener();

  // Lắng nghe Enter cho toàn bộ input/select
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // tránh reload form
        addRow();
      }
    });
  });
};

// Định dạng số tiền
function formatCurrency(number) {
  return Number(number || "").toLocaleString("vi-VN");
}

async function fetchTrips() {
  try {
    const res = await fetch(API_TRIPS);
    if (!res.ok) throw new Error("Không thể kết nối server");
    const trips = await res.json();
    renderTable(trips);
  } catch (err) {
    console.error("❌ Lỗi khi lấy phiếu chuyến:", err);
    alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
  }
}

function renderTable(trips) {
  const tbody = document.querySelector("#transTable tbody");
  tbody.innerHTML = "";

  trips.forEach((t) => {
    const formattedDate = t.ngay
      ? (() => {
          const [year, month, day] = t.ngay.slice(0, 10).split("-");
          return `${parseInt(day)}-${parseInt(month)}-${year}`;
        })()
      : "";

    const formattedSoKhoi = formatCurrency(t.so_khoi);
    const formattedDonGia = formatCurrency(t.don_gia);
    const formattedSoTien = formatCurrency(t.so_tien);

    let amountClass = "currency";
    t.tinh_trang.toLowerCase() === "nợ" ? (amountClass += " red") : (amountClass += " green");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${t.so_chuyen}</td>
      <td>${t.cong_ty || ""}</td>
      <td>${t.cung_duong || ""}</td>
      <td>${formattedSoKhoi}</td>
      <td>${formattedDonGia}</td>
      <td class="${amountClass}">${formattedSoTien}</td>
      <td>${t.tinh_trang}</td>
      <td class="note-cell" title="${t.ghi_chu}">${t.ghi_chu || ""}</td>
      <td><button class="deleteRow-btn" onclick="deleteTrip(${t.id})"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });
}

// Gắn sự kiện khi thay đổi tình trạng
function setupTinhTrangListener() {
  const tinhTrangSelect = document.getElementById("tinhTrangInput");
  tinhTrangSelect.addEventListener("change", () => {
    const container = document.getElementById("paidAmountContainer");

    if (tinhTrangSelect.value.toLowerCase() === "đã thanh toán") {
      container.innerHTML = `
        <label for="paidAmountInput">Số tiền thanh toán:</label>
        <input type="number" id="paidAmountInput" step="1000" />
      `;
    } else {
      container.innerHTML = "";
    }
  });
}

// Thêm phiếu chuyến
async function addRow() {
  const ngay = document.getElementById("dateInput").value;
  const so_chuyen = parseInt(document.getElementById("soChuyenInput").value) || 0;
  const cong_ty = document.getElementById("congTyInput").value;
  const cung_duong = document.getElementById("cungDuongInput").value;
  const so_khoi = parseFloat(document.getElementById("soKhoiInput").value.replace(",", ".")) || 0;
  const don_gia = parseFloat(document.getElementById("donGiaInput").value.replace(/\./g, "")) || 0;
  const tinh_trang = document.getElementById("tinhTrangInput").value;
  const ghi_chu = document.getElementById("ghiChuInput").value;

  // Nếu có nhập số tiền thanh toán thì lấy, nếu không thì tự tính
  const paidInput = document.getElementById("paidAmountInput");
  let so_tien = so_chuyen * so_khoi * don_gia;
  if (paidInput && paidInput.value.trim() !== "") {
    so_tien = parseFloat(paidInput.value) || so_tien;
  }

  const trip = {
    ngay,
    so_chuyen,
    cong_ty,
    cung_duong,
    so_khoi,
    don_gia,
    so_tien,
    tinh_trang,
    ghi_chu,
  };

  try {
    const res = await fetch(API_TRIPS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error("Không thể thêm phiếu chuyến");
    fetchTrips();
  } catch (err) {
    console.error("❌ Lỗi khi thêm phiếu chuyến:", err);
    alert("Không thể thêm phiếu chuyến. Vui lòng thử lại.");
  }
}

// Xóa phiếu chuyến
async function deleteTrip(id) {
  try {
    const res = await fetch(`${API_TRIPS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xoá phiếu chuyến");
    fetchTrips();
  } catch (err) {
    console.error("❌ Lỗi khi xoá phiếu chuyến:", err);
    alert("Không thể xoá phiếu chuyến. Vui lòng thử lại.");
  }
}

// Xóa/Reset input
function clearInputs() {
  document.querySelectorAll("input, select").forEach((el) => (el.value = ""));
  document.getElementById("tinhTrangInput").value = "NỢ";
  document.getElementById("paidAmountContainer").innerHTML = "";
}

// Xuất excel
function exportToExcel() {
  const table = document.getElementById("transTable");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table, { raw: true });

  XLSX.utils.book_append_sheet(wb, ws, "Phieu_Chuyen");
  XLSX.writeFile(wb, `Phieu_Chuyen.xlsx`);
}
