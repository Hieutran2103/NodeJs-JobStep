const express = require("express");
const router = express.Router();
const testUser = require("../middleware/testUser");

const {
  createJob,
  deleteJob,
  getAllJobs,
  getJob,
  showStats,
  updateJob,
} = require("../controllers/jobs");

router.get("/", getAllJobs);
router.get("/stats", showStats);
router.post("/", testUser, createJob);
router.get("/:id", testUser, getJob);
router.patch("/:id", testUser, updateJob);
router.delete("/:id", testUser, deleteJob);

module.exports = router;
