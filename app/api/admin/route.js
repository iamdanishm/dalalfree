import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/app/lib/models/User";
import Property from "@/app/lib/models/Property";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await User.find().select("name email role createdAt");
  const properties = await Property.find().populate("ownerId", "name email");
  // KYC is now per-property - count properties with KYC files pending verification
  const pendingKyc = await Property.countDocuments({
    verified: false,
    $or: [
      { "kycFiles.aadhaar": { $exists: true, $ne: [] } },
      { "kycFiles.pan": { $exists: true, $ne: null } },
      { "kycFiles.agreement": { $exists: true, $ne: null } },
      { "kycFiles.video": { $exists: true, $ne: null } },
    ],
  });
  return NextResponse.json({ users, properties, pendingKyc });
}
