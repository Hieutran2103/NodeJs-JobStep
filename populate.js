require("dotenv").config();

const mockData = require("./mock-data.json");

const JobSchema = require("./models/Job");
const connectDB = require("./db/connect");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    await JobSchema.create(mockData);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};
start();
