import { catchAsyncError } from "../utils/catchAsyncError.js";
import ErrorHandler from "../utils/error.js";
import { Job } from "../models/jobSchema.js";

export const getAllJobs = catchAsyncError(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobCount: jobs.length,
    jobs,
  });
});

export const createJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job seeker is not allowed to create a job", 400)
    );
  }
  const {
    title,
    company,
    description,
    category,
    country,
    state,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
  } = req.body;

  if (
    !title ||
    !company ||
    !description ||
    !category ||
    !country ||
    !state ||
    !city ||
    !location
  ) {
    return next(new ErrorHandler("Please provide complete job details", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please provide either fixed salary or ranged salary",
        400
      )
    );
  }
  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler(
        "Fixed salary and Ranged salary cannot be entered together",
        400
      )
    );
  }

  const postedBy = req.user._id;

  const job = await Job.create({
    title,
    company,
    description,
    category,
    country,
    state,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
  });

  res.status(200).json({
    success: true,
    message: "Job posted successfully",
    job,
  });
});

export const getMyJobs = catchAsyncError(async (req, res, next) => {
  const { role, _id } = req.user;

  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job seeker is not allowed to access myjobs", 400)
    );
  }

  const jobs = await Job.find({ postedBy: _id });

  res.status(200).json({
    success: true,
    jobCount: jobs.length,
    jobs,
  });
});

export const updateJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job seeker is not allowed to update a job", 400)
    );
  }
  const { id } = req.params;

  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    job,
  });
});

export const deleteJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job seeker is not allowed to delete a job", 400)
    );
  }
  const { id } = req.params;

  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

export const getSingleJob = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  res.status(200).json({
    success: true,
    job,
  });
});
