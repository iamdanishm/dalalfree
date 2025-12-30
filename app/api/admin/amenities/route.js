import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Amenity from "@/app/lib/models/Amenity";
import path from "path";
import fs from "fs";

// GET /api/admin/amenities - Get paginated list of amenities
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");

    // Build query
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    // Get amenities with pagination
    const amenities = await Amenity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Amenity.countDocuments(query);

    return NextResponse.json({
      amenities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}

// POST /api/admin/amenities - Create new amenity with image upload
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle multipart form data
    const formData = await req.formData();
    const title = formData.get("title");
    const available = formData.get("available") === "true";
    const imageFile = formData.get("image");

    // Validate required fields
    if (!title || !imageFile) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title cannot exceed 100 characters" },
        { status: 400 }
      );
    }

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

    // Generate unique filename (same as upload.js)
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1e9);
    const extension = path.extname(imageFile.name);
    const filename = `${timestamp}-${randomId}${extension}`;

    // Save file to disk (same destination as upload.js)
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

    // Create amenity in database
    const imageUrl = `/uploads/amenities/images/${filename}`;

    const amenity = await Amenity.create({
      title: title.trim(),
      image: imageUrl,
      available,
    });

    return NextResponse.json({
      message: "Amenity created successfully",
      amenity: {
        _id: amenity._id,
        title: amenity.title,
        image: amenity.image,
        available: amenity.available,
        createdAt: amenity.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating amenity:", error);

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
      { error: "Failed to create amenity" },
      { status: 500 }
    );
  }
}
