import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import User from "@/app/lib/models/User";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
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
        const { contactType = "phone", method } = await req.json();

        // 1. Get Property and Owner
        const property = await Property.findById(id).populate("ownerId");
        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        // 2. Determine Credit Cost (default 1, maybe 0 for trial/free)
        // Simplified logic: If subscription is active or trial, cost is 0 or covered. 
        // If pay-per-view, cost is 1.
        // For now, let's assume standard 1 credit or check subscription.

        // Check if already revealed
        const existingHistory = await UserContactHistory.findOne({
            userId: session.user.id,
            propertyId: id
        });

        if (existingHistory) {
            // Already revealed, just return the info again
            const owner = property.ownerId;
            return NextResponse.json({
                success: true,
                contact: {
                    name: owner.name,
                    phone: owner.phone || owner.contact || "Not Available",
                    email: owner.email
                },
                message: "Contact already revealed"
            });
        }

        // 3. Process Logic
        // Here we would deduct credits. For this task, I'll log it directly.

        const owner = property.ownerId;
        const contactValue = contactType === 'email' ? owner.email : (owner.phone || owner.contact);

        if (!contactValue) {
            return NextResponse.json(
                { error: "Contact details not available for this property owner" },
                { status: 404 }
            );
        }

        // 4. Log to History (Lead)
        await UserContactHistory.create({
            userId: session.user.id,
            propertyId: id,
            contactType: contactType,
            contactValue: contactValue,
            creditsUsed: 1 // Default
        });

        return NextResponse.json({
            success: true,
            contact: {
                name: owner.name,
                phone: owner.phone || owner.contact || "Not Available",
                email: owner.email
            }
        });

    } catch (error) {
        console.error("Error revealing contact:", error);
        return NextResponse.json(
            { error: "Failed to reveal contact" },
            { status: 500 }
        );
    }
}
