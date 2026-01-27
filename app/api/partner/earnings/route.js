import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/auth";

// GET /api/partner/earnings - Get earnings summary
export const GET = requirePartner(async (request) => {
    try {
        await connectDB();

        const user = request.user;

        // Fetch properties that have commissions (either paid or pending)
        const propertiesWithCommission = await Property.find({
            ownerId: user._id,
            partnerCommission: { $gt: 0 }
        }).select("title price partnerCommission commissionPaid commissionPaidDate createdAt");

        // Calculate statistics locally (or use aggregation if data is large)
        let totalPaidEarnings = 0;
        let totalPendingCommission = 0;

        propertiesWithCommission.forEach(prop => {
            if (prop.commissionPaid) {
                totalPaidEarnings += prop.partnerCommission;
            } else if (prop.status === "approved") { // Only count approved properties towards pending
                totalPendingCommission += prop.partnerCommission;
            }
        });

        // Recent earnings (last 5)
        const recentEarnings = propertiesWithCommission
            .filter(p => p.commissionPaid)
            .sort((a, b) => (b.commissionPaidDate || b.updatedAt) - (a.commissionPaidDate || a.updatedAt))
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            summary: {
                totalEarnings: user.totalEarnings, // Overall tracked earnings in user doc
                withdrawnAmount: user.withdrawnAmount,
                pendingWithdrawals: user.pendingWithdrawals,
                availableBalance: user.totalEarnings - user.withdrawnAmount - user.pendingWithdrawals,
                pendingCommission: totalPendingCommission, // What is coming soon (approved props not yet paid)
            },
            recentEarnings
        });
    } catch (error) {
        console.error("Partner earnings error:", error);
        return NextResponse.json(
            { error: "Failed to fetch earnings summary" },
            { status: 500 }
        );
    }
});
