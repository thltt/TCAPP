let transactions = [];

// Định dạng tiền tệ
function formatCurrency(number) {
  return Number(number || 0).toLocaleString("vi-VN");
}

// Tải dữ liệu tồn đầu và giao dịch từ server
async function loadData() {
  try {
    // Lấy tồn đầu
    const resBalance = await fetch("https://tcapp-pearl.vercel.app/api/starting-balance");
    const dataBalance = await resBalance.json();
    const startingBalance = parseFloat(dataBalance.starting_balance) || 0;

    // Lấy danh sách giao dịch
    const resTransactions = await fetch("https://tcapp-pearl.vercel.app/api/transactions");
    transactions = await resTransactions.json();
    if (!Array.isArray(transactions)) transactions = [];

    // Render bảng
    renderTable(transactions, startingBalance);

    // Cập nhật hiển thị tồn đầu
    document.getElementById("startingBalance").innerText = formatCurrency(startingBalance);
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
    alert("Không thể tải dữ liệu từ server.");
  }
}

// Nhập giá trị tồn đầu
async function inputStartingBalance() {
  const inputElement = document.getElementById("startingBalanceInput");
  const inputValue = parseFloat(inputElement.value);
  if (isNaN(inputValue)) {
    alert("Vui lòng nhập số hợp lệ.");
    return;
  }

  try {
    const response = await fetch("https://tcapp-pearl.vercel.app/api/starting-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starting_balance: inputValue }),
    });

    if (!response.ok) throw new Error("Lỗi khi lưu tồn đầu");

    inputElement.value = "";
    await loadData();
  } catch (err) {
    console.error(err);
    alert("Không thể lưu tồn đầu lên server.");
  }
}

// Xóa giá trị tồn đầu
async function deleteStartingBalance() {
  try {
    const response = await fetch("https://tcapp-pearl.vercel.app/api/starting-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starting_balance: 0 }),
    });

    if (!response.ok) throw new Error("Lỗi khi xóa tồn đầu");
    await loadData();
  } catch (err) {
    console.error(err);
    alert("Lỗi khi xóa tồn đầu");
  }
}

// Hiển thị bảng dữ liệu
function renderTable(transactions, startingBalance = 0) {
  const tableBody = document.getElementById("transactionTable").getElementsByTagName("tbody")[0];

  // Xóa toàn bộ hàng cũ
  tableBody.innerHTML = "";

  // Tính số dư từ dưới lên
  let balance = startingBalance;
  const balances = [];
  for (let i = transactions.length - 1; i >= 0; i--) {
    const amount = parseFloat(transactions[i].amount) || 0;
    const isThu = String(transactions[i].category).toLowerCase() === "thu";
    balance += isThu ? amount : -amount;
    balances[i] = balance;
  }

  // Render từng dòng
  transactions.forEach((t, index) => {
    const row = tableBody.insertRow(-1);
    const amount = parseFloat(t.amount) || 0;
    const formattedDate = t.date
      ? (() => {
          const [year, month, day] = t.date.slice(0, 10).split("-");
          return `${parseInt(day)}-${parseInt(month)}-${year}`;
        })()
      : "";

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${t.name || ""}</td>
      <td>${t.type || ""}</td>
      <td class="currency">${formatCurrency(amount)}</td>
      <td>${t.category || ""}</td>
      <td class="currency">${formatCurrency(balances[index])}</td>
      <td><button class="deleteRow-btn" onclick="deleteTransaction(${t.id})"><i class="fa-solid fa-trash"></i></button></td>
    `;
  });
}

// Thêm giao dịch mới
async function addRow() {
  const dateInput = document.getElementById("dateInput").value;
  const name = document.getElementById("nameInput").value;
  const type = document.getElementById("typeInput").value;
  const amount = parseFloat(document.getElementById("amountInput").value);
  const category = document.getElementById("categoryInput").value;

  if (!dateInput || !type || isNaN(amount)) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  // Lấy thời gian hiện tại để kết hợp với ngày
  const now = new Date();
  const dateTime = `${dateInput} ${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  const data = {
    date: dateTime,
    name,
    type,
    amount,
    category,
    note: "",
  };

  try {
    const response = await fetch("https://tcapp-pearl.vercel.app/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Lỗi khi thêm giao dịch");

    await loadData();
  } catch (error) {
    console.error("Lỗi kết nối server:", error);
    alert("Không kết nối được tới server.");
  }
}

// Xóa giao dịch
async function deleteTransaction(id) {
  try {
    const response = await fetch(`https://tcapp-pearl.vercel.app/api/transactions/${id}`, {
      method: "DELETE",
    });
    await loadData();
    if (!response.ok) throw new Error("Xóa không thành công");
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    alert("Không thể kết nối tới server để xóa.");
  }
}

// Xóa dữ liệu form
function clearInputs() {
  document.getElementById("dateInput").value = "";
  document.getElementById("nameInput").value = "Em Đại";
  document.getElementById("typeInput").value = "";
  document.getElementById("amountInput").value = "";
  document.getElementById("categoryInput").value = "Chi";
}

// Xuất Excel
function exportToExcel() {
  const table = document.getElementById("transactionTable");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table, { raw: true });

  Object.keys(ws).forEach((cell) => {
    if (cell[0] === "!") return;
    const raw = ws[cell].v || "";

    if (typeof raw === "string" && raw.match(/^\d{1,3}(\.\d{3})*$/)) {
      const numberValue = Number(raw.replace(/\./g, ""));
      ws[cell].v = numberValue;
      ws[cell].t = "n";
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "GiaoDich");
  XLSX.writeFile(wb, `Thu_Chi.xlsx`);
}

// Khi load trang
window.onload = () => {
  loadData();

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
