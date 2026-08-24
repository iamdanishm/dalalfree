import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";
import { profileUpdateSchema } from "@/app/lib/validations/auth";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

export const PUT = requireAuth(async (request) => {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Validate with Zod
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      throw new AppError("Validation failed", 400, formatZodErrors(result.error));
    }

    const { name, phone } = result.data;

    // 2. Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      request.user._id,
      {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
});

export const GET = requireAuth(async (request) => {
  try {
    await connectDB();

    const user = await User.findById(request.user._id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
});

