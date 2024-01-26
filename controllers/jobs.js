const JobSchema = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const mongoose = require("mongoose");
const moment = require("moment");

const getAllJobs = async (req, res, next) => {
  console.log(req.query);
  const { status, jobType, sort, search } = req.query;

  const queryObject = {
    createdBy: req.user.userID,
  };

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }
  // No awai
  let result = JobSchema.find(queryObject);

  // sap xep
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const jobs = await result;
  const totalJobs = await JobSchema.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const createJob = async (req, res, next) => {
  req.body.createdBy = req.user.userID;
  const job = await JobSchema.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const getJob = async (req, res, next) => {
  // do middleware authentication
  const {
    user: { userID },
    params: { id: jobId },
  } = req;
  console.log(userID, jobId);
  const job = await JobSchema.findOne({ _id: jobId, createdBy: userID });
  if (!job) {
    throw new NotFoundError(`Job not found with id ${job}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const updateJob = async (req, res, next) => {
  const {
    body: { company, position },
    user: { userID },
    params: { id: jobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }
  const job = await JobSchema.findByIdAndUpdate(
    { _id: jobId, createdBy: userID },
    { company, position },
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`Job not found with id ${job}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res, next) => {
  const {
    user: { userID },
    params: { id: jobId },
  } = req;

  const job = await JobSchema.findByIdAndDelete({
    _id: jobId,
    createdBy: userID,
  });
  if (!job) {
    throw new NotFoundError(`Job not found with id ${job}`);
  }
  res.status(StatusCodes.OK).send({ job });
};

const showStats = async (req, res, next) => {
  let stats = await JobSchema.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userID) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    declined: stats.declined || 0,
    interview: stats.interview || 0,
  };

  let monthlyApplications = await JobSchema.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userID) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  console.log(monthlyApplications);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    // ngược lại để theo thứ tự tăng dần những data xa nhất
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
