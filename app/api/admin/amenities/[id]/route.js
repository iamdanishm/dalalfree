import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Amenity from "@/app/lib/models/Amenity";
import { uploadAmenityImages } from "@/app/lib/upload.js";
import { UploadBridge } from "@/app/lib/upload-bridge.js";
import { UPLOAD_CONFIG } from "@/app/lib/upload-config.js";
import path from "path";
import fs from "fs";

// Wrapper for multer middleware in App Router
const runMiddleware = (req, middleware) => {
  return new Promise((resolve, reject) => {
    middleware(req, {}, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

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
      // Validate file type
      const allowedImageTypes = UPLOAD_CONFIG.allowedTypes.image;
      if (!allowedImageTypes.includes(imageFile.type.toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Only image files are allowed: " + allowedImageTypes.join(", "),
          },
          { status: 400 }
        );
      }

      // Validate file size
      const maxSize = UPLOAD_CONFIG.maxFileSize.amenity;
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { error: `Image size cannot exceed ${maxSize / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }

      // Delete old image if it exists
      if (existingAmenity.image) {
        const filename = path.basename(existingAmenity.image);
        const oldImagePath = path.join(
          UPLOAD_CONFIG.baseDir,
          "amenities",
          "images",
          filename
        );
        try {
          await fs.promises.access(oldImagePath, fs.constants.F_OK);
          await fs.promises.unlink(oldImagePath);
        } catch (err) {
          // File doesn't exist or other error, ignore
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      const extension = imageFile.name.split(".").pop();
      const filename = `${timestamp}-${randomId}.${extension}`;

      // Save new file to external directory
      const dirPath = await UploadBridge.getStoragePath(null, "amenities");
      const fullPath = path.join(dirPath, filename);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.promises.writeFile(fullPath, buffer);

      imageUrl = UploadBridge.getFileUrl(null, "amenities", filename);
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

    // Delete associated image file from external directory
    if (amenity.image) {
      const filename = path.basename(amenity.image);
      const imagePath = path.join(
        UPLOAD_CONFIG.baseDir,
        "amenities",
        "images",
        filename
      );
      try {
        await fs.promises.access(imagePath, fs.constants.F_OK);
        await fs.promises.unlink(imagePath);
      } catch (err) {
        // File doesn't exist or other error, ignore
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
