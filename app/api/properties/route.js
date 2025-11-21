import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";

// GET all properties
export async function GET() {
  await connectDB();
  const properties = await Property.find().populate("ownerId", "name email");
  return NextResponse.json(properties);
}

// POST new property (partners and sellers only)
export const POST = requireAuth(async function (req) {
  await connectDB();

  const userId = req.user._id;
  const role = req.user.role;
  if (role !== "partner" && role !== "seller")
    return NextResponse.json(
      { error: "Only partners and sellers can list properties" },
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
});
