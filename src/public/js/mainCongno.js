const API_DEBTS = "https://tcapp-pearl.vercel.app/api/debts";

window.onload = fetchDebts();
window.onload = () => {
  fetchDebts();

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

//  Hiển thị bảng dữ liệu công nợ
async function fetchDebts() {
  try {
    const res = await fetch(API_DEBTS);
    if (!res.ok) throw new Error("Không thể kết nối server!");
    const debt = await res.json();
    renderTable(debt);
  } catch (err) {
    console.error("❌ Lỗi khi lấy phiếu chuyến:", err);
    alert("Không thể kết nối tới server. Vui lòng thử lại sau.");
  }
}

function renderTable(debt) {
  const tbody = document.querySelector("#transDebtTable tbody");
  tbody.innerHTML = "";

  debt.forEach((t) => {
    const formattedDate = t.ngay
      ? (() => {
          const [year, month, day] = t.ngay.slice(0, 10).split("-");
          return `${parseInt(day)}-${parseInt(month)}-${year}`;
        })()
      : "";
    const formattedSoTien = formatCurrency(t.so_tien);

    let amountClass = "currency";
    t.loai_gd.toLowerCase() === "nợ" ? (amountClass += " red") : (amountClass += " green");

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${t.noi_dung}</td>
        <td>${t.loai_gd}</td>
        <td class="${amountClass}">${formattedSoTien}</td>
        <td class="note-cell" title="${t.ghi_chu}">${t.ghi_chu}</td>
        <td><button class="deleteRow-btn" onclick="deleteDebt(${t.id})"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(row);
  });
}

// Thêm công nợ mới
async function addRow() {
  const ngay = document.getElementById("dateInput").value;
  const noi_dung = document.getElementById("noiDungInput").value;
  const loai_gd = document.getElementById("transTypeInput").value;
  const so_tien = parseFloat(document.getElementById("amoutInput").value.replace(/\./g, "")) || 0;
  const ghi_chu = document.getElementById("ghiChuInput").value;

  const debt = { ngay, noi_dung, loai_gd, so_tien, ghi_chu };
  try {
    const res = await fetch(API_DEBTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(debt),
    });
    if (!res.ok) throw new Error("Không thể thêm công nợ mới");
    fetchDebts();
  } catch (err) {
    console.error("Lỗi khi thêm công nợ mới", err);
    alert("Lỗi khi thêm công nợ mới, liên hệ Admin");
  }
}

// Xóa công nợ
async function deleteDebt(id) {
  try {
    const res = await fetch(`${API_DEBTS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Không thể xóa công nợ");
    fetchDebts();
  } catch (err) {
    console.error("❌Không thể xóa công nợ", err);
    alert("Lỗi khi xóa công nợ, liên hệ với Admin");
  }
}

function clearInputs() {
  document.querySelectorAll("input, select").forEach((el) => (el.value = ""));
  document.getElementById("transTypeInput").value = "NỢ";
}

// xuất Excel
function exportToExcel() {
  const table = document.getElementById("transDebtTable");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table, { raw: true });

  XLSX.utils.book_append_sheet(wb, ws, "Cong_No");
  XLSX.writeFile(wb, `Cong_No.xlsx`);
}
