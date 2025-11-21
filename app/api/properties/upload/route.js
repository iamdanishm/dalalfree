import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import {
  uploadPropertyImages,
  uploadPropertyVideos,
  getStorageStats,
} from "@/app/lib/upload";

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET /api/properties/upload - Get property storage stats and limits
export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storageStats = getStorageStats();

  // Get user's properties count
  const userPropertiesCount = await Property.countDocuments({
    ownerId: session.user.id,
  });

  return NextResponse.json({
    storage: storageStats,
    limits: {
      images: "10MB per image",
      videos: "100MB per video",
      totalProperties: "Unlimited by role",
    },
    stats: {
      propertyCount: userPropertiesCount,
      maxImagesPerProperty: 10,
      maxVideosPerProperty: 1,
    },
  });
}

// POST /api/properties/upload - Upload property files
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Parse multipart form data
    const formData = await req.formData();
    const propertyId = formData.get("propertyId");
    const fileType = formData.get("fileType"); // 'images' or 'videos'
    const files = formData.getAll("files"); // Multiple files

    if (!propertyId || !fileType || files.length === 0) {
      return NextResponse.json(
        {
          error: "Missing propertyId, fileType, or files",
          required: ["propertyId", "fileType", "files"],
        },
        { status: 400 }
      );
    }

    // Verify property ownership
    const property = await Property.findOne({
      _id: propertyId,
      ownerId: session.user.id,
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found or access denied" },
        { status: 404 }
      );
    }

    // Process files based on type
    const uploadedFiles = [];
    const existingImages = property.images || [];
    const existingVideos = []; // Property schema doesn't have videos array, add if needed

    // This is a simplified implementation
    // In production, you'd want to:
    // 1. Process files one by one with proper validation
    // 2. Store files securely with proper naming
    // 3. Update database with file URLs
    // 4. Handle errors gracefully
    // 5. Optimize file processing (resize images, compress videos)

    for (const file of files) {
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}-${file.name}`;
      let fileUrl;

      if (fileType === "images") {
        // Limit total images per property
        if (existingImages.length >= 10) {
          return NextResponse.json(
            { error: "Maximum 10 images per property reached" },
            { status: 400 }
          );
        }
        fileUrl = `/uploads/properties/images/${fileName}`;
        existingImages.push(fileUrl);
      } else if (fileType === "videos") {
        // Limit to 1 video per property for now
        if (existingVideos.length >= 1) {
          return NextResponse.json(
            { error: "Only 1 video per property allowed" },
            { status: 400 }
          );
        }
        fileUrl = `/uploads/properties/videos/${fileName}`;
        existingVideos.push(fileUrl);
      } else {
        return NextResponse.json(
          { error: "Invalid fileType. Use 'images' or 'videos'" },
          { status: 400 }
        );
      }

      uploadedFiles.push({
        originalName: file.name,
        savedName: fileName,
        url: fileUrl,
        size: file.size,
        type: fileType,
      });
    }

    // Update property with new file URLs
    property.images = existingImages;
    await property.save();

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} ${fileType} uploaded successfully`,
      property: {
        id: property._id,
        title: property.title,
        uploadedFiles,
        totalImages: property.images.length,
      },
    });
  } catch (error) {
    console.error("Property upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/upload - Update property files
export async function PUT(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Similar to POST but for updating existing files
  // Implementation would handle file replacement/deletion
  return NextResponse.json({
    message: "PUT method for updating property files - implementation pending",
  });
}
