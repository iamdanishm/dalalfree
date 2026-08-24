import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      throw new AppError("Invalid JSON body", 400);
    }

    const { email, otp } = body;

    // 1. Basic validation
    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    await connectDB();

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("Invalid email or OTP", 400);
    }

    // 3. Rate limiting check
    const LOCKOUT_TIME = 15 * 60 * 1000;
    const MAX_ATTEMPTS = 5;

    if (user.resetPasswordOtpAttempts >= MAX_ATTEMPTS && user.lastOtpAttempt) {
      const timeSinceLastAttempt = Date.now() - new Date(user.lastOtpAttempt).getTime();
      if (timeSinceLastAttempt < LOCKOUT_TIME) {
        const remainingMinutes = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
        throw new AppError(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`, 429);
      } else {
        user.resetPasswordOtpAttempts = 0;
      }
    }

    // 4. Check if account is active
    if (user.accountStatus?.toLowerCase() !== "active") {
      throw new AppError("Account is not active. Please contact support.", 403);
    }

    // 5. Verify OTP
    if (!user.resetPasswordOtp) {
      throw new AppError("OTP not found or already used. Please request a new one.", 400);
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isOtpValid) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      user.lastOtpAttempt = new Date();
      await user.save();
      
      const remainingAttempts = MAX_ATTEMPTS - user.resetPasswordOtpAttempts;
      throw new AppError(`Invalid OTP. ${remainingAttempts > 0 ? remainingAttempts : 0} attempts remaining.`, 400);
    }

    // 6. Check expiry
    if (!user.resetPasswordOtpExpiry || user.resetPasswordOtpExpiry < new Date()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    // 7. Success - Generate reset token
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Configuration error: JWT secret missing");
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: "password_reset",
        tokenVersion: user.password ? user.password.substring(0, 10) : "new_user"
      },
      secret,
      { expiresIn: "30m" }
    );

    // 8. Clear OTP
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    return NextResponse.json(
      {
        message: "OTP verified successfully.",
        resetToken: resetToken,
        expiresIn: "30 minutes",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

