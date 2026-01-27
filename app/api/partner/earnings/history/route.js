import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/auth";

// GET /api/partner/earnings/history - Get detailed earnings history
export const GET = requirePartner(async (request) => {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 20;

        const query = {
            ownerId: request.user._id,
            partnerCommission: { $gt: 0 },
            commissionPaid: true
        };

        const skip = (page - 1) * limit;
        const history = await Property.find(query)
            .sort({ commissionPaidDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("title price partnerCommission commissionPaidDate commissionTransactionId description")
            .lean();

        const totalCount = await Property.countDocuments(query);

        return NextResponse.json({
            success: true,
            history,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        console.error("Partner earnings history error:", error);
        return NextResponse.json(
            { error: "Failed to fetch earnings history" },
            { status: 500 }
        );
    }
});
