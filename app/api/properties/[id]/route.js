import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET single property
export async function GET(_, { params }) {
  await connectDB();
  const { id } = await params;
  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

// PUT update property
export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;
  const role = session.user.role;

  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if current user is owner or admin
  if (property.ownerId.toString() !== userId && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await Property.findByIdAndUpdate(id, body, {
    new: true,
  });
  return NextResponse.json(updated);
}

// DELETE property
export async function DELETE(_, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;
  const role = session.user.role;

  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (property.ownerId.toString() !== userId && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Property.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
