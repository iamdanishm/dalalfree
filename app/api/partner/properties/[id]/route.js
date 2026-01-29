import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/auth";

export const GET = requirePartner(async (request, { params }) => {
    try {
        await connectDB();
        const { id } = await params;

        const property = await Property.findOne({
            _id: id,
            ownerId: request.user._id
        });

        if (!property) {
            return NextResponse.json(
                { success: false, error: "Property not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            property
        });
    } catch (error) {
        console.error("Error fetching partner property:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
});
