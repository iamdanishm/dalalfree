import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Property from "@/app/lib/models/Property";

// GET /api/admin/properties - Admin view with full details
export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const verified = searchParams.get("verified");
  const featured = searchParams.get("featured");
  const hasKyc = searchParams.get("hasKyc"); // "true" for properties with KYC docs
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const query = {};
  if (status) query.status = status;
  if (verified !== null) query.verified = verified === "true";
  if (featured !== null) query.featured = featured === "true";

  // Handle search and hasKyc conditions
  const andConditions = [];

  if (search) {
    query.$text = { $search: search };
  }


  if (hasKyc === "true") {
    andConditions.push({
      $or: [
        { "kycFiles.aadhaar": { $exists: true, $ne: [] } },
        { "kycFiles.pan": { $exists: true, $ne: null } },
        { "kycFiles.agreement": { $exists: true, $ne: null } },
        { "kycFiles.video": { $exists: true, $ne: null } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  const skip = (page - 1) * limit;
  const properties = await Property.find(query)
    .populate("ownerId", "name email phone role isVerified")
    .populate("approvedBy", "name email")
    .populate("societyAmenities", "name title icon image category")
    .select("-__v")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Add kycFiles summary to each property
  const propertiesWithKycSummary = properties.map((prop) => ({
    ...prop,
    kycSummary: {
      hasAadhaar: prop.kycFiles?.aadhaar?.length > 0 || false,
      hasPan: !!prop.kycFiles?.pan,
      hasAgreement: !!prop.kycFiles?.agreement,
      hasVideo: !!prop.kycFiles?.video,
      isComplete:
        (prop.kycFiles?.aadhaar?.length > 0 || prop.kycFiles?.pan) &&
        prop.kycFiles?.agreement,
    },
  }));

  const total = await Property.countDocuments(query);

  return NextResponse.json({
    properties: propertiesWithKycSummary,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// GET /api/admin/properties/analytics - Property metrics
export async function POST() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const total = await Property.countDocuments();
  const pending = await Property.countDocuments({ status: "pending" });
  const approved = await Property.countDocuments({ status: "approved" });
  const rejected = await Property.countDocuments({ status: "rejected" });
  const verified = await Property.countDocuments({ verified: true });
  const featured = await Property.countDocuments({ featured: true });

  // Property distribution by category for UI chart
  const propertyStats = await Property.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  // Map to UI expected format with percentages
  const totalCount = await Property.countDocuments();
  const categoryStats = [
    { type: "Residential", count: 0, percentage: 0 },
    { type: "Commercial", count: 0, percentage: 0 },
    { type: "Industrial", count: 0, percentage: 0 },
    { type: "Land", count: 0, percentage: 0 },
  ];

  // Fill actual data
  propertyStats.forEach((stat) => {
    const found = categoryStats.find((cat) => cat.type === stat._id);
    if (found) {
      found.count = stat.count;
      found.percentage =
        totalCount > 0 ? Math.round((stat.count / totalCount) * 100) : 0;
    }
  });

  return NextResponse.json({
    total,
    byStatus: {
      pending,
      approved,
      rejected,
      active: approved,
    },
    byVerification: {
      verified,
      notVerified: total - verified,
    },
    featured,
    propertyStats: categoryStats, // UI expects this format
  });
}
