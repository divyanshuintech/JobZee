import express from "express";
import {
  getAllJobs,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  getSingleJob,
} from "../controllers/jobController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.get("/alljobs", getAllJobs);
router.get("/myjobs", isAuthorized, getMyJobs);
router.get("/:id", isAuthorized, getSingleJob);
router.post("/create", isAuthorized, createJob);
router.put("/update/:id", isAuthorized, updateJob);
router.delete("/delete/:id", isAuthorized, deleteJob);

export default router;
