const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/", (req, res) => productController.getAll(req, res));
router.get("/:id", (req, res) => productController.getById(req, res));
router.post("/", (req, res) => productController.create(req, res));
router.put("/:id", (req, res) => productController.update(req, res));
router.delete("/:id", (req, res) => productController.delete(req, res));

module.exports = router;
