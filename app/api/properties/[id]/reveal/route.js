import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContactService } from "@/app/lib/services/ContactService";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            throw new AppError("Unauthorized", 401);
        }

        const { id } = await params;
        const { contactType = "phone" } = await req.json();

        // Delegate to Service Layer (includes transaction)
        const { owner, alreadyRevealed } = await ContactService.revealContact(
            session.user.id,
            id,
            contactType
        );

        return NextResponse.json({
            success: true,
            contact: {
                name: owner.name,
                phone: owner.phone || owner.contact || "Not Available",
                email: owner.email
            },
            message: alreadyRevealed ? "Contact already revealed" : "Contact revealed successfully"
        });

    } catch (error) {
        return handleApiError(error);
    }
}

