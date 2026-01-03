import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Amenity from "@/app/lib/models/Amenity";

// GET /api/amenities - Get all available amenities
export async function GET() {
  try {
    await connectDB();

    const amenities = await Amenity.find({ available: true })
      .sort({ createdAt: -1 })
      .select("_id title createdAt")
      .lean();

    return NextResponse.json({ amenities });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}
