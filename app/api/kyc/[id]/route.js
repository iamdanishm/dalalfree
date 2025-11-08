import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const updated = await Kyc.findByIdAndUpdate(
    params.id,
    { status: data.status, remarks: data.remarks },
    { new: true }
  );

  return NextResponse.json(updated);
}
