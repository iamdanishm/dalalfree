import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";

// GET all properties
export async function GET() {
  try {
    await connectDB();
    const properties = await Property.find().populate("ownerId", "name email");
    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);

    // Check if it's a database connection error
    if (
      error.message?.includes("database") ||
      error.message?.includes("connect")
    ) {
      return NextResponse.json(
        {
          error: "Database temporarily unavailable",
          message:
            "The backend server is currently experiencing database connectivity issues. Please try again in a few moments.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch properties", message: error.message },
      { status: 500 }
    );
  }
}

// POST new property
export const POST = requireAuth(async function (req) {
  try {
    await connectDB();

    const userId = req.user._id;
    const role = req.user.role;
    if (role !== "partner" && role !== "user") {
      return NextResponse.json(
        { error: "Only partners and users can list properties" },
        { status: 403 }
      );
    }

    // Check KYC status
    const kyc = await Kyc.findOne({ userId });
    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json({ error: "KYC not approved" }, { status: 403 });
    }

    const body = await req.json();

    // Generate unique slug from title if not provided
    const slug = body.slug || (await generateUniquePropertySlug(body.title));

    const property = await Property.create({
      ...body,
      slug,
      ownerId: userId,
      verified: true, // auto-verified since KYC approved
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error creating property:", error);

    // Handle database connectivity issues
    if (
      error.message?.includes("database") ||
      error.message?.includes("connect") ||
      error.name === "MongooseError"
    ) {
      return NextResponse.json(
        {
          error: "Database temporarily unavailable",
          message:
            "Unable to create property due to database connectivity issues. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create property", message: error.message },
      { status: 500 }
    );
  }
});
