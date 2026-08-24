import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requirePartner } from "@/app/lib/auth";
import { handleApiError } from "@/app/lib/utils/errors";

// GET /api/partner/earnings - Get earnings summary
export const GET = requirePartner(async (request) => {
    try {
        await connectDB();
        const user = request.user;

        // Fetch properties that have commissions (either paid or pending)
        const propertiesWithCommission = await Property.find({
            ownerId: user._id,
            partnerCommission: { $gt: 0 }
        }).select("title price partnerCommission commissionPaid commissionPaidDate createdAt status updatedAt");

        // Calculate statistics locally
        let totalPendingCommission = 0;
        propertiesWithCommission.forEach(prop => {
            if (!prop.commissionPaid && prop.status === "approved") {
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
                totalEarnings: user.totalEarnings || 0,
                withdrawnAmount: user.withdrawnAmount || 0,
                pendingWithdrawals: user.pendingWithdrawals || 0,
                availableBalance: (user.totalEarnings || 0) - (user.withdrawnAmount || 0) - (user.pendingWithdrawals || 0),
                pendingCommission: totalPendingCommission,
            },
            recentEarnings
        });
    } catch (error) {
        return handleApiError(error);
    }
});

