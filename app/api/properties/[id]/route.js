import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";

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
export const PUT = requireAuth(async function (req, { params }) {
  await connectDB();

  const { id } = await params;
  const userId = req.user._id;
  const role = req.user.role;

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
});

// DELETE property
export const DELETE = requireAuth(async function (req, { params }) {
  await connectDB();

  const { id } = await params;
  const userId = req.user._id;
  const role = req.user.role;

  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (property.ownerId.toString() !== userId && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Property.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
});
