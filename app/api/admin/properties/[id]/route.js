import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json(); // "approved" or "rejected"
  const updated = await Property.findByIdAndUpdate(
    params.id,
    { status },
    { new: true }
  );
  return NextResponse.json(updated);
}
