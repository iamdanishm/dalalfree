import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 0;

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(session.user.id).select("role partnerRequestStatus");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                role: user.role,
                partnerRequestStatus: user.partnerRequestStatus
            }
        });
    } catch (error) {
        console.error("Error fetching user status:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
