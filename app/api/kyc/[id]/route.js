import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";

export const PUT = requireAuth(async function (req, { params }) {
  await connectDB();
  if (req.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const updated = await Kyc.findByIdAndUpdate(
    params.id,
    { status: data.status, remarks: data.remarks },
    { new: true }
  );

  return NextResponse.json(updated);
});
