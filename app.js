require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

//connectDB
const connectDB = require("./db/connect");
const authenticate = require("./middleware/authentication");

//routers
const authRoute = require("./routes/auth");
const jobsRoute = require("./routes/jobs");
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// extra security packages

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(xss());
// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/jobs", authenticate, jobsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
