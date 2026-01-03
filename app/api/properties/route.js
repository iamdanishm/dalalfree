import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";

// GET all properties with search/filter functionality
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "buy";
    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    const propertyType = searchParams.get("propertyType");
    const budgetMin = searchParams.get("budgetMin");
    const budgetMax = searchParams.get("budgetMax");
    const sortBy = searchParams.get("sort") || "relevance";
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;

    // Build query object
    let query = {};

    // Tab filter (buy/rent/commercial)
    if (tab === "buy") {
      query.propertyType = "sell";
    } else if (tab === "rent") {
      query.propertyType = "rent";
    } else if (tab === "commercial") {
      query.category = "Commercial";
    }

    // City filter
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Locality filter
    if (locality) {
      query.locality = { $regex: locality, $options: "i" };
    }

    // Property type filter (BHK, office, etc.)
    if (propertyType) {
      query.bhk = { $regex: propertyType, $options: "i" };
    }

    // Budget filter
    if (budgetMin || budgetMax) {
      query.price = {};
      const min = budgetMin ? parseInt(budgetMin) : 0;
      const max = budgetMax ? parseInt(budgetMax) : null;

      if (max) {
        query.price.$gte = min;
        query.price.$lte = max;
      } else {
        query.price.$gte = min;
      }
    }

    // Verified filter - only show verified properties by default for public search
    // If verifiedOnly parameter is not provided or is not "false", show only verified properties
    const verifiedOnlyParam = searchParams.get("verifiedOnly");
    if (!verifiedOnlyParam || verifiedOnlyParam !== "false") {
      query.verified = true;
    }

    // Build sort object
    let sortOptions = {};
    switch (sortBy) {
      case "price-low":
        sortOptions.price = 1;
        break;
      case "price-high":
        sortOptions.price = -1;
        break;
      case "verified-first":
        sortOptions.verified = -1;
        sortOptions.createdAt = -1;
        break;
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1; // Default to newest first
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const properties = await Property.find(query)
      .populate("ownerId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Property.countDocuments(query);

    return NextResponse.json({
      success: true,
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
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
