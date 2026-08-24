import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { sendEmail } from "@/app/lib/email";
import { resetPasswordRequestSchema } from "@/app/lib/validations/auth";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      throw new AppError("Invalid JSON body", 400);
    }

    // 1. Validate with Zod
    const result = resetPasswordRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: formatZodErrors(result.error),
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    await connectDB();

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with this email exists, a password reset OTP has been sent.",
        },
        { status: 200 }
      );
    }

    // 3. Check if account is active
    if (user.accountStatus?.toLowerCase() !== "active") {
      throw new AppError("Account is not active. Please contact support.", 403);
    }

    // 4. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 5. Hash OTP for secure storage
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 6. Set OTP expiry (15 minutes from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with hashed OTP
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpiry = otpExpiry;
    user.resetPasswordOtpAttempts = 0; // Reset attempts on new OTP request
    await user.save();

    // 7. Send OTP email
    try {
      await sendEmail(email.toLowerCase(), "passwordResetOtp", {
        otp: otp, // Send plain OTP to user
        name: user.name,
        email: user.email,
      });

      return NextResponse.json(
        {
          message:
            "Password reset OTP sent successfully. Please check your email.",
          expiresIn: "15 minutes",
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      // Rollback OTP on email failure
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();

      throw new AppError("Failed to send email. Please try again later.", 500);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

