const UserSchema = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError, BadRequestError } = require("../errors");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // gán người dùng vào job router

    const testUser = payload.userID === "65b25dc18dee5953d05925f5";
    req.user = { userID: payload.userID, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};
module.exports = authenticate;
