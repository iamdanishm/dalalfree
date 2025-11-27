import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { sendEmail } from "@/app/lib/email";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
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

    // Check if account is active
    if (user.accountStatus !== "active") {
      return NextResponse.json(
        { error: "Account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiry (15 minutes from now)
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendEmail(email, "passwordResetOtp", {
        otp: otp,
        name: user.name,
        email: user.email,
      });

      console.log(`📧 Password reset OTP sent to ${email}`);

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

      // If email fails, clear the OTP from database
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();

      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
