import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/app/lib/models/User";

// GET /api/admin/users/analytics - User stats (registration charts, growth)
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Total users by role
  const totalUsers = await User.countDocuments();
  const totalBuyers = await User.countDocuments({ role: "user" });
  const totalPartners = await User.countDocuments({ role: "partner" });
  const totalAdmins = await User.countDocuments({ role: "admin" });

  const verified = await User.countDocuments({ isVerified: true });
  const suspended = await User.countDocuments({ accountStatus: "suspended" });

  // Registration growth - last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newRegistrations = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Monthly growth (simple count)
  const monthlyUsers = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  // Import Property and Kyc for cross-entity metrics
  const Property = (await import("@/app/lib/models/Property")).default;
  const Kyc = (await import("@/app/lib/models/Kyc")).default;

  // Get related metrics
  const activeProperties = await Property.countDocuments({
    status: "approved",
  });
  const pendingKyc = await Kyc.countDocuments({ status: "pending" });

  // Revenue placeholder - would come from payments table
  const monthlyRevenue = 12450; // Placeholder until payments implemented

  return NextResponse.json({
    metrics: [
      {
        title: "Total Users",
        value: totalUsers.toString(),
        change: "+12%", // Calculate actual from monthlyGrowth
        positive: true,
      },
      {
        title: "Active Properties",
        value: activeProperties.toString(),
        change: "+8%", // Placeholder
        positive: true,
      },
      {
        title: "Pending KYC",
        value: pendingKyc.toString(),
        change: "-5%", // Placeholder
        positive: false,
      },
      {
        title: "Monthly Revenue",
        value: `$${monthlyRevenue.toLocaleString()}`,
        change: "+18%", // Placeholder
        positive: true,
      },
    ],
    detailedStats: {
      totals: {
        totalUsers,
        totalBuyers,
        totalPartners,
        totalAdmins,
        verified,
        suspended,
        active: totalUsers - suspended,
        newThisWeek: newRegistrations,
      },
      monthlyGrowth: monthlyUsers,
    },
  });
}
