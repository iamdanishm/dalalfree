import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import bcrypt from "bcrypt";
import { requireAuth } from "@/app/lib/auth";
import { changePasswordSchema } from "@/app/lib/validations/auth";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

export const POST = requireAuth(async function (req) {
  try {
    await connectDB();
    
    const body = await req.json();

    // 1. Validate with Zod
    const result = changePasswordSchema.safeParse(body);
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

    const { currentPassword, newPassword } = result.data;
    const userId = req.user._id;

    // 2. Get user (with password)
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 3. Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    // 4. Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError("New password must be different from current password", 400);
    }

    // 5. Hash and update
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    return handleApiError(error);
  }
});