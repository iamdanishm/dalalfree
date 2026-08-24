import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { UserService } from "@/app/lib/services/UserService";
import { handleApiError } from "@/app/lib/utils/errors";

export const POST = requireAuth(async (req) => {
    try {
        await connectDB();
        
        // Delegate business logic to UserService
        await UserService.submitPartnerRequest(req.user._id);
        
        return NextResponse.json({ 
            success: true, 
            message: "Partner request submitted successfully" 
        });

    } catch (error) {
        return handleApiError(error);
    }
});


