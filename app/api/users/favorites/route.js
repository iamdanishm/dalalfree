import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import UserFavorites from "@/app/lib/models/UserFavorites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/users/favorites - Get user's favorited properties
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
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "newest";

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const result = await UserFavorites.getUserFavorites(session.user.id, {
      page,
      limit,
      sortBy
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch favorites",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/users/favorites - Add property to favorites
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { propertyId, notes } = await req.json();

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Validate notes if provided
    if (notes && (typeof notes !== "string" || notes.length > 500)) {
      return NextResponse.json(
        { error: "Notes must be a string with maximum 500 characters" },
        { status: 400 }
      );
    }

    const favorite = await UserFavorites.addFavorite(
      session.user.id,
      propertyId,
      notes || ""
    );

    // Populate property details for response
    await favorite.populateProperty();

    return NextResponse.json({
      success: true,
      favorite,
      message: "Property added to favorites"
    });

  } catch (error) {
    console.error("Error adding favorite:", error);

    if (error.message === "Property not found") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (error.message === "Cannot favorite archived property") {
      return NextResponse.json(
        { error: "Cannot favorite archived property" },
        { status: 400 }
      );
    }

    if (error.message === "Property is already in favorites") {
      return NextResponse.json(
        { error: "Property is already in favorites" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add favorite",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/favorites - Remove property from favorites
export async function DELETE(req) {
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
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const deletedFavorite = await UserFavorites.removeFavorite(
      session.user.id,
      propertyId
    );

    if (!deletedFavorite) {
      return NextResponse.json(
        { error: "Property was not in favorites" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property removed from favorites"
    });

  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove favorite",
        message: error.message
      },
      { status: 500 }
    );
  }
}