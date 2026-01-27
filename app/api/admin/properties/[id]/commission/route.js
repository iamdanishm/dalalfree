import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { markCommissionAsPaid } from "@/app/lib/services/commissionService";

// PUT /api/admin/properties/[id]/commission - Mark commission as paid
export async function PUT(req, { params }) {
    try {
        await connectDB();

        // Auth check
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const { transactionId } = await req.json();

        const updatedProperty = await markCommissionAsPaid(id, transactionId);

        return NextResponse.json({
            success: true,
            message: "Commission marked as paid and partner earnings updated",
            property: updatedProperty
        });
    } catch (error) {
        console.error("Commission update error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update commission" },
            { status: 500 }
        );
    }
}
