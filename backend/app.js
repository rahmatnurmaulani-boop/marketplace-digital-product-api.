const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const userRoutes = require("./src/routes/user.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use("/api/auth", authRoutes); 
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/practice/users", userRoutes);

// Root test endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Marketplace Digital Product REST API is running!",
  });
});

// 404 Handler untuk route yang tidak terdaftar
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handling middleware global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada internal server",
  });
});

module.exports = app;
