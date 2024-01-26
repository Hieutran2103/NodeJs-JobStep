const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentication");
const testUser = require("../middleware/testUser");

const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15p
  max: 10, //  Giới hạn mỗi địa chỉ IP đến 10 yêu cầu trong khoảng thời gian windowMs
  message: {
    msg: "too many requests from the server, please try again after 15 minutes",
  },
});

const { login, register, updateUser } = require("../controllers/auth");
router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);
router.patch("/updateUser", authenticate, testUser, updateUser);

module.exports = router;
