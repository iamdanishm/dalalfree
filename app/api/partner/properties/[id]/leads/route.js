import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export const GET = requireAuth(async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        // Verify property ownership
        const property = await Property.findOne({
            _id: id,
            ownerId: req.user.id
        });

        if (!property) {
            throw new AppError("Property not found or unauthorized", 404);
        }

        // Fetch leads
        const leads = await UserContactHistory.find({ propertyId: id })
            .populate("userId", "name email phone")
            .sort({ createdAt: -1 })
            .lean();

        // Format leads
        const formattedLeads = leads.map(lead => ({
            _id: lead._id,
            user: {
                name: lead.userId?.name || "Unknown User",
                email: lead.userId?.email,
                phone: lead.userId?.phone
            },
            contactType: lead.contactType,
            revealedAt: lead.contactRevealedAt,
            creditsUsed: lead.creditsUsed
        }));

        return NextResponse.json({
            success: true,
            leads: formattedLeads
        });

    } catch (error) {
        return handleApiError(error);
    }
});

