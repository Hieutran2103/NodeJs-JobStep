const UserSchema = require("../models/User");

const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name , email or password");
  }
  const user = await UserSchema.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email or password");
  }
  // find email
  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  //Check password
  const isPasswordCorrect = await user.checkPassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Password not true");
  }

  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const updateUser = async (req, res, next) => {
  const {
    body: { name, email, lastName, location },
    user: { userID },
  } = req;

  if (name === "" || email === "" || lastName === "" || location === "") {
    throw new BadRequestError(" Please provide all values");
  }
  const user = await UserSchema.findByIdAndUpdate({ _id: userID }, req.body, {
    new: true,
    runValidators: true,
  });
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

module.exports = { register, login, updateUser };
