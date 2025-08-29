const app = require("./app");
const port = process.env.PORT || 8010;

// Khởi động server
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server đang chạy trên cổng ${port}`);
});
