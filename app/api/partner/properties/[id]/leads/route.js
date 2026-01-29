import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Verify property ownership
        const property = await Property.findOne({
            _id: id,
            ownerId: session.user.id
        });

        if (!property) {
            return NextResponse.json(
                { error: "Property not found or unauthorized" },
                { status: 404 }
            );
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
        console.error("Error fetching leads:", error);
        return NextResponse.json(
            { error: "Failed to fetch leads" },
            { status: 500 }
        );
    }
}
