const { BadRequestError } = require("../errors");

const testUser = (req, res, next) => {
  console.log(req.user.testUser);
  if (req.user.testUser) {
    throw new BadRequestError("Test user read only");
  }
  next();
};
module.exports = testUser;
