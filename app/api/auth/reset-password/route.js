import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
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

    const { resetToken, newPassword, confirmPassword } = body;

    // Validate input
    const errors = [];
    if (!resetToken) errors.push("resetToken");
    if (!newPassword) errors.push("newPassword");
    if (!confirmPassword) errors.push("confirmPassword");

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["resetToken", "newPassword", "confirmPassword"],
          missing: errors,
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check password complexity (at least one uppercase, lowercase, and number)
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify the reset token
    let decodedToken;
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL: JWT secret is not defined in environment");
        return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    try {
      decodedToken = jwt.verify(resetToken, secret);
    } catch (tokenError) {
      if (tokenError.name === "TokenExpiredError") {
        return NextResponse.json(
          {
            error:
              "Reset token has expired. Please request a new password reset.",
          },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { error: "Invalid reset token." },
          { status: 401 }
        );
      }
    }

    // Validate token payload
    if (!decodedToken.userId || decodedToken.type !== "password_reset") {
      return NextResponse.json(
        { error: "Invalid reset token." },
        { status: 401 }
      );
    }

    // Find user by ID
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Verify token version (prevent replay attacks)
    const currentTokenVersion = user.password ? user.password.substring(0, 10) : "new_user";
    if (decodedToken.tokenVersion !== currentTokenVersion) {
        return NextResponse.json(
            { error: "This reset link has already been used or is invalid." },
            { status: 401 }
        );
    }

    // Check if account is active
    if (user.accountStatus?.toLowerCase() !== "active") {
      return NextResponse.json(
        { error: "Account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    console.log(`🔑 Password reset successful for user: ${user.email}`);

    return NextResponse.json(
      {
        message:
          "Password reset successful. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
