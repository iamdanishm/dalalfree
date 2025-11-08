import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/app/lib/models/User";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await User.find().select("name email role createdAt");
  const properties = await Property.find().populate("ownerId", "name email");
  const kycs = await Kyc.find().populate("userId", "name email");
  return NextResponse.json({ users, properties, kycs });
}
