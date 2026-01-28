import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";

export const POST = requireAuth(async (req) => {
    try {
        await connectDB();
        const userId = req.user._id;
        console.log(`[PartnerRequest] Received request from user: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            console.error(`[PartnerRequest] User not found: ${userId}`);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role === "partner") {
            console.log(`[PartnerRequest] User ${userId} is already a partner`);
            return NextResponse.json({ error: "You are already a partner" }, { status: 400 });
        }

        if (user.partnerRequestStatus === "pending") {
            console.log(`[PartnerRequest] User ${userId} already has a pending request`);
            return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
        }

        user.partnerRequestStatus = "pending";
        user.partnerRequestDate = new Date();

        console.log(`[PartnerRequest] Attempting to save user ${userId}`);
        try {
            await user.save();
            console.log(`[PartnerRequest] Successfully saved user ${userId}`);
            return NextResponse.json({ success: true, message: "Partner request submitted successfully" });
        } catch (saveError) {
            console.error("[PartnerRequest] Save failed validation:", saveError.errors || saveError);
            return NextResponse.json({
                error: "Failed to save request",
                details: saveError.message
            }, { status: 400 });
        }
    } catch (error) {
        console.error("[PartnerRequest] API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
});
