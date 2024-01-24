const JobSchema = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res, next) => {
  const jobs = await JobSchema.find({}).sort("createdAt");
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
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

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
