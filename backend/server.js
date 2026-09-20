const app = require("./app");
const pool = require("./src/config/database");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Verifikasi koneksi database sebelum memulai HTTP server
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Berhasil terhubung ke database MySQL Laragon!");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server aktif berjalan di: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gagal terhubung ke database MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
