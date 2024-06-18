import { catchAsyncError } from "../utils/catchAsyncError.js";
import ErrorHandler from "../utils/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwt.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill complete information!"));
  }
  const isEmailExists = await User.findOne({ email });

  if (isEmailExists) {
    return next(new ErrorHandler("Email already exists!"));
  }

  const user = await User.create({ name, email, phone, password, role });

  sendToken(user, 200, res, "User registered successfully");
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please enter complete information!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or passsword!", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or passsword!", 400));
  }

  if (user.role !== role) {
    return next(new ErrorHandler("User with this role is not found!", 400));
  }

  sendToken(user, 200, res, "User logged in successfully");
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
