import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";

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

    const { email, otp } = body;

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        {
          error: "Both email and OTP are required.",
          required: ["email", "otp"],
          missing: [!email ? "email" : null, !otp ? "otp" : null].filter(
            Boolean
          ),
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be 6 digits." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or OTP." },
        { status: 400 }
      );
    }

    // Check for rate limiting (max 5 attempts, 15 min lockout)
    const LOCKOUT_TIME = 15 * 60 * 1000;
    const MAX_ATTEMPTS = 5;

    if (user.resetPasswordOtpAttempts >= MAX_ATTEMPTS && user.lastOtpAttempt) {
      const timeSinceLastAttempt = Date.now() - new Date(user.lastOtpAttempt).getTime();
      if (timeSinceLastAttempt < LOCKOUT_TIME) {
        const remainingMinutes = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { error: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.` },
          { status: 429 }
        );
      } else {
        // Reset attempts after lockout period
        user.resetPasswordOtpAttempts = 0;
      }
    }

    // Check if account is active
    if (user.accountStatus?.toLowerCase() !== "active") {
      return NextResponse.json(
        { error: "Account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Check if OTP exists and matches
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      user.lastOtpAttempt = new Date();
      await user.save();
      
      const remainingAttempts = MAX_ATTEMPTS - user.resetPasswordOtpAttempts;
      return NextResponse.json({ 
        error: "Invalid OTP.",
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      // Clear expired OTP
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save();

      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP is valid - generate a reset token that will be used for password reset
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL: JWT secret is not defined in environment");
        return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: "password_reset",
        tokenVersion: user.password ? user.password.substring(0, 10) : "new_user" // Version the token based on current password hash
      },
      secret,
      { expiresIn: "30m" } // 30 minutes to complete password reset
    );

    // Clear the OTP and attempts after successful verification
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
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
