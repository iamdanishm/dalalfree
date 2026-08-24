import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { loginSchema } from "@/app/lib/validations/auth";
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
    const result = loginSchema.safeParse(body);
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

    const { email, password } = result.data;

    await connectDB();

    // 2. Find user
    const user = await User.findOne({ email });

    // Use generic error for security
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    // 4. Check if account is active
    if (user.accountStatus?.toLowerCase() !== "active") {
      throw new AppError(`Account is ${user.accountStatus}. Please contact support.`, 403);
    }

    // 5. Generate JWT token
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

