import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";

// GET single property
export async function GET(_, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Find property by ID or slug
    let property;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid MongoDB ObjectId format
      property = await Property.findById(id).populate({
        path: "amenities.society",
        model: "Amenity",
        select: "title",
      });
    } else {
      // Otherwise, try to find by slug
      property = await Property.findOne({ slug: id }).populate({
        path: "amenities.society",
        model: "Amenity",
        select: "title",
      });
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property: property.toObject(),
    });
  } catch (error) {
    console.error("Error fetching property:", error);

    // Handle MongoDB ObjectId errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid property ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
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

  // Regenerate slug if title is being updated or if slug is provided
  let updateData = body;
  if (body.title || body.slug) {
    const newSlug =
      body.slug || (await generateUniquePropertySlug(body.title, id));
    updateData = { ...body, slug: newSlug };
  }

  const updated = await Property.findByIdAndUpdate(id, updateData, {
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
