import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all properties
export async function GET() {
  await connectDB();
  const properties = await Property.find().populate("ownerId", "name email");
  return NextResponse.json(properties);
}

// POST new property (only verified sellers)
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, role } = session.user;
  if (role !== "seller" && role !== "partner")
    return NextResponse.json(
      { error: "Only sellers or partners can list properties" },
      { status: 403 }
    );

  // Check KYC status
  const kyc = await Kyc.findOne({ userId });
  if (!kyc || kyc.status !== "approved")
    return NextResponse.json({ error: "KYC not approved" }, { status: 403 });

  const body = await req.json();
  const property = await Property.create({
    ...body,
    ownerId: userId,
    verified: true, // auto-verified since KYC approved
  });

  return NextResponse.json(property);
}
