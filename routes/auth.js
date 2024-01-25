const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentication");

const { login, register, updateUser } = require("../controllers/auth");
router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticate, updateUser);

module.exports = router;
