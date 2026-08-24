import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export const revalidate = 0;

export const GET = requireAuth(async (req) => {
    try {
        await connectDB();
        const user = await User.findById(req.user.id).select("role partnerRequestStatus");

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return NextResponse.json({
            success: true,
            user: {
                role: user.role,
                partnerRequestStatus: user.partnerRequestStatus
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
});

