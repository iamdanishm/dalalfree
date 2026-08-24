import { NextResponse } from "next/server";
import { UserService } from "@/app/lib/services/UserService";
import { registerSchema } from "@/app/lib/validations/auth";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Validate input with Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      throw new AppError("Validation failed", 400, formatZodErrors(result.error));
    }

    // 2. Register via UserService (handles hashing and duplication check)
    const newUser = await UserService.register(result.data);

    // 3. Success response
    return NextResponse.json(
      {
        message: "User registered successfully",
        redirectTo: "/onboard",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          accountStatus: newUser.accountStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}


