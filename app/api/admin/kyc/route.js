import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Kyc from "@/app/lib/models/Kyc";

// GET /api/admin/kyc - List KYC by status (pending/rejected/approved)
export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // pending, approved, rejected
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const kycs = await Kyc.find(query)
    .populate("userId", "name email phone role isVerified createdAt")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Kyc.countDocuments(query);

  return NextResponse.json({
    kycs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// GET /api/admin/kyc/analytics - KYC completion rates
export async function POST(req) {
  // This would normally be separate endpoint, but for simplicity
  // Return analytics data for KYC
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const total = await Kyc.countDocuments();
  const pending = await Kyc.countDocuments({ status: "pending" });
  const approved = await Kyc.countDocuments({ status: "approved" });
  const rejected = await Kyc.countDocuments({ status: "rejected" });

  // Completion rate
  const completionRate = total > 0 ? ((approved + rejected) / total) * 100 : 0;

  return NextResponse.json({
    total,
    pending,
    approved,
    rejected,
    completionRate: Math.round(completionRate),
  });
}
