import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";

// GET /api/partner/properties - Get partner's properties with commission data
export const GET = requirePartner(async (request) => {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit")) || 50;
        const page = parseInt(searchParams.get("page")) || 1;

        const query = { ownerId: request.user._id };
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const properties = await Property.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalCount = await Property.countDocuments(query);

        return NextResponse.json({
            success: true,
            properties,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        console.error("Partner pulse error:", error);
        return NextResponse.json(
            { error: "Failed to fetch partner properties" },
            { status: 500 }
        );
    }
});

// POST /api/partner/properties - Create property as partner
export const POST = requirePartner(async (request) => {
    try {
        await connectDB();

        const body = await request.json();
        const partnerId = request.user._id;

        // Generate unique slug
        const slug = body.slug || (await generateUniquePropertySlug(body.title));

        // Calculate initial commission (90% by default if not set on user, 
        // but we use the user's current commission rate)
        const commissionRate = request.user.partnerCommissionRate || 0.9;
        const price = body.price || 0;
        const partnerCommission = price * commissionRate;

        const property = await Property.create({
            ...body,
            slug,
            ownerId: partnerId,
            partnerCommission,
            verified: false,
            status: "pending",
        });

        return NextResponse.json({
            success: true,
            property,
            message: "Property listed successfully",
        });
    } catch (error) {
        console.error("Partner property creation error:", error);
        return NextResponse.json(
            { error: "Failed to create property", message: error.message },
            { status: 500 }
        );
    }
});
