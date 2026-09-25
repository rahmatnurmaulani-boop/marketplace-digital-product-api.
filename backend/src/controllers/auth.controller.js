const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validasi input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal: Nama, email, dan password wajib diisi.",
        });
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email sudah terdaftar. Silakan gunakan email lain.",
        });
      }

      // Hash password dengan bcrypt (salt 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user ke database
      const newUserId = await userRepo.create({
        name,
        email,
        password: hashedPassword,
        role: role || "buyer",
      });

      return res.status(201).json({
        success: true,
        message: "Registrasi berhasil.",
        data: {
          id: newUserId,
          name,
          email,
          role: role || "buyer",
        },
      });
    } catch (error) {
      console.error("Error register:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email dan password wajib diisi.",
        });
      }

      // Cari user berdasarkan email
      const user = await userRepo.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah.",
        });
      }

      // Cocokkan password plain dengan hash di database
      let isMatch = false;
      // Mendukung password lama yang belum di-hash maupun password baru bcrypt
      if (
        user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$")
      ) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = password === user.password;
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah.",
        });
      }

      // Buat JWT Token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET || "super_secret_jwt_key_marketplace_2026",
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
      );

      return res.status(200).json({
        success: true,
        message: "Login berhasil.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error login:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Terjadi kesalahan pada server.",
      });
    }
  }
}

module.exports = new AuthController();
