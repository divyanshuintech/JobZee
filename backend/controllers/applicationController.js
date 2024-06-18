import { catchAsyncError } from "../utils/catchAsyncError.js";
import ErrorHandler from "../utils/error.js";
import { Application } from "../models/applicationSchema.js";
import cloudinary from "cloudinary";
import { Job } from "../models/jobSchema.js";

export const employerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler(
          "Job seeker is not allowed to access job applications",
          400
        )
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({
      "employerId.user": _id,
    });

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access job seeker applications",
          400
        )
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({
      "applicantId.user": _id,
    });

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to delete an application",
          400
        )
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("No such application is found", 404));
    }

    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  }
);

export const postApplication = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer is not allowed to apply on a job", 400)
    );
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume file is required", 400));
  }

  const { resume } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler(
        "Invalid file format, Please upload a PNG, JPG or WEBP format file",
        400
      )
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  //console.log(cloudinaryResponse);

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error: ",
      cloudinaryResponse.error || "Unknown cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload resume", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantId = {
    user: req.user._id,
    role: "Job Seeker",
  };

  if (!jobId) {
    return next(new ErrorHandler("Job not found", 404));
  }

  const jobDetails = await Job.findById(jobId);
  
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found", 404));
  }
  const employerId = {
    user: jobDetails.postedBy,
    role: "Employer",
  };

  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantId ||
    !employerId ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantId,
    employerId,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted",
    application,
  });
});
