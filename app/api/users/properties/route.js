import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/users/properties - Get current user's properties
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    // If action is 'count', just return the count
    if (action === "count") {
      const count = await Property.countDocuments({
        ownerId: session.user.id,
        isArchived: { $ne: true }
      });

      return NextResponse.json({
        success: true,
        hasProperties: count > 0,
        count
      });
    }

    // Build query
    let query = {
      ownerId: session.user.id,
      isArchived: { $ne: true }
    };

    // Add search filter if provided
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } }
      ];
    }

    // Build sort options
    let sortOption = { createdAt: -1 }; // default: newest first

    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "status":
        sortOption = { status: 1, createdAt: -1 }; // status first, then newest
        break;
    }

    // Get properties with search and sort
    const properties = await Property.find(query)
      .select("title slug propertyType category price location status createdAt images bhk builtUpArea furnishing verified featured city state")
      .sort(sortOption)
      .lean();

    return NextResponse.json({
      success: true,
      properties,
      total: properties.length
    });

  } catch (error) {
    console.error("Error fetching user properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        message: error.message
      },
      { status: 500 }
    );
  }
}