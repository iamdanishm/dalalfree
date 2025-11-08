import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET logged-in user's KYC
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kyc = await Kyc.findOne({ userId: session.user.id });
  return NextResponse.json(kyc || {});
}

// POST new KYC submission
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const existing = await Kyc.findOne({ userId: session.user.id });
  if (existing)
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });

  const newKyc = await Kyc.create({
    userId: session.user.id,
    aadhaarPhoto: data.aadhaarPhoto,
    agreementPhoto: data.agreementPhoto,
    videoUrl: data.videoUrl,
  });

  return NextResponse.json(newKyc);
}
