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
        { status: 404 }
      );
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
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // Check if OTP is expired
    if (
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      // Clear expired OTP
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();

      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // OTP is valid - generate a reset token that will be used for password reset
    const resetToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: "password_reset",
      },
      process.env.NEXTAUTH_SECRET ||
      process.env.JWT_SECRET ||
      "fallback-secret",
      { expiresIn: "30m" } // 30 minutes to complete password reset
    );

    // Clear the OTP after successful verification
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
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
