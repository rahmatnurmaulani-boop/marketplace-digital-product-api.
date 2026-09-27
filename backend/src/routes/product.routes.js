const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authenticate = require("../middlewares/auth.middleware");

// Public Endpoints
router.get("/", (req, res) => productController.getAll(req, res));
router.get("/:id", (req, res) => productController.getById(req, res));

// Protected Endpoints (Wajib membawa Bearer Token JWT)
router.post("/", authenticate, (req, res) =>
  productController.create(req, res),
);
router.put("/:id", authenticate, (req, res) =>
  productController.update(req, res),
);
router.patch("/:id", authenticate, (req, res) =>
  productController.patch(req, res),
);
router.delete("/:id", authenticate, (req, res) =>
  productController.delete(req, res),
);

module.exports = router;
