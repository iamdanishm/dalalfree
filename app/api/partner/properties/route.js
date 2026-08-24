import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/middleware/roleCheck";
import { generateUniquePropertySlug } from "@/app/lib/slug";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";
import { paginationSchema } from "@/app/lib/validations/common";

// GET /api/partner/properties - Get partner's properties
export const GET = requirePartner(async (request) => {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        
        // Validate pagination
        const result = paginationSchema.safeParse(Object.fromEntries(searchParams));
        if (!result.success) {
            throw new AppError("Invalid query parameters", 400, formatZodErrors(result.error));
        }

        const { page, limit } = result.data;
        const status = searchParams.get("status");

        const query = { ownerId: request.user._id, isArchived: { $ne: true } };
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
        return handleApiError(error);
    }
});

// POST /api/partner/properties - Create property as partner
export const POST = requirePartner(async (request) => {
    try {
        await connectDB();

        const body = await request.json();
        const partnerId = request.user._id;

        // Note: Full Zod validation for property creation is complex due to many fields.
        // For now, we standardize the error handling and move to Service Layer in Phase 3.
        if (!body.title) {
            throw new AppError("Property title is required", 400);
        }

        // Generate unique slug
        const slug = body.slug || (await generateUniquePropertySlug(body.title));

        // Calculate initial commission
        const commissionRate = request.user.partnerCommissionRate || 0.9;
        const price = parseFloat(body.price) || 0;
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
        return handleApiError(error);
    }
});

