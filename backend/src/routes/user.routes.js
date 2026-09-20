const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", (req, res) => userController.getAll(req, res));
router.get("/:id", (req, res) => userController.getById(req, res));

router.get("/practice/users", (req, res) => userController.getAll(req, res));
router.get("/practice/users/:id", (req, res) =>
  userController.getById(req, res),
);

module.exports = router;
