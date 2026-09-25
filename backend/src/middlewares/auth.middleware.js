const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Cek apakah Authorization header ada dan diawali dengan 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak disediakan (401 Unauthorized).",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifikasi token menggunakan JWT_SECRET
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_jwt_key_marketplace_2026",
    );

    // Simpan payload user ke dalam req.user agar bisa diakses di controller
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Sesi tidak valid atau token kadaluarsa (401 Unauthorized).",
    });
  }
};

module.exports = authenticate;
