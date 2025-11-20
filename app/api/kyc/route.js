import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";

// GET logged-in user's KYC
export const GET = requireAuth(async function (request) {
  await connectDB();

  const kyc = await Kyc.findOne({ userId: request.user._id });
  return NextResponse.json(kyc || {});
});

// POST new KYC submission
export const POST = requireAuth(async function (request) {
  await connectDB();

  const data = await request.json();
  const existing = await Kyc.findOne({ userId: request.user._id });
  if (existing)
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });

  const newKyc = await Kyc.create({
    userId: request.user._id,
    aadhaarPhoto: data.aadhaarPhoto,
    agreementPhoto: data.agreementPhoto,
    videoUrl: data.videoUrl,
  });

  return NextResponse.json(newKyc);
});
