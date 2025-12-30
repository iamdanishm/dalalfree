import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Amenity from "@/app/lib/models/Amenity";
import path from "path";
import fs from "fs";

// PUT /api/admin/amenities/[id] - Update amenity
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Find existing amenity
    const existingAmenity = await Amenity.findById(id);
    if (!existingAmenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const available = formData.get("available") === "true";
    const imageFile = formData.get("image");

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title cannot exceed 100 characters" },
        { status: 400 }
      );
    }

    let imageUrl = existingAmenity.image;

    // Handle image upload if provided
    if (imageFile) {
      // Validate file type (same as upload.js)
      const allowedImageTypes = /jpeg|jpg|png|gif|bmp|webp|tiff|tif/i;
      if (!allowedImageTypes.test(path.extname(imageFile.name).toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Only image files are allowed (jpeg, jpg, png, gif, bmp, webp, tiff, tif)",
          },
          { status: 400 }
        );
      }

      // Validate file size (5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size cannot exceed 5MB" },
          { status: 400 }
        );
      }

      // Delete old image if it exists
      if (existingAmenity.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "uploads",
          existingAmenity.image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Generate unique filename (same as upload.js)
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      const extension = path.extname(imageFile.name);
      const filename = `${timestamp}-${randomId}${extension}`;

      // Save new file to disk (same destination as upload.js)
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "amenities",
        "images"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      imageUrl = `/uploads/amenities/images/${filename}`;
    }

    // Update amenity in database
    const updatedAmenity = await Amenity.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        image: imageUrl,
        available,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: "Amenity updated successfully",
      amenity: {
        _id: updatedAmenity._id,
        title: updatedAmenity.title,
        image: updatedAmenity.image,
        available: updatedAmenity.available,
        createdAt: updatedAmenity.createdAt,
        updatedAt: updatedAmenity.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating amenity:", error);

    // Handle duplicate title error
    if (error.code === "DUPLICATE_TITLE") {
      return NextResponse.json(
        { error: "An amenity with this title already exists" },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update amenity" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/amenities/[id] - Delete amenity
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Find and delete amenity
    const amenity = await Amenity.findByIdAndDelete(id);

    if (!amenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 });
    }

    // Delete associated image file
    if (amenity.image) {
      const imagePath = path.join(process.cwd(), "uploads", amenity.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return NextResponse.json({
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    return NextResponse.json(
      { error: "Failed to delete amenity" },
      { status: 500 }
    );
  }
}
