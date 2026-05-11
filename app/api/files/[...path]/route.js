import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/db";
import { UPLOAD_CONFIG } from "@/app/lib/upload-config";
import { UploadBridge } from "@/app/lib/upload-bridge.js";
import Property from "@/app/lib/models/Property";
import path from "path";
import fs from "fs";

// Secure file serving API with access control
export async function GET(req, { params }) {
  await connectDB();

  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join("/");

    // Parse secure path: properties/{hash}/{type}/{filename}
    const pathParts = filePath.split("/");
    let propertyId = null;
    let hasAccess = false;
    let actualFilePath = filePath; // Default to original path
    let requiresAuth = false;

    if (pathParts[0] === "amenities") {
      // Amenities are master data - public access
      hasAccess = true;
      actualFilePath = filePath; // Use original path for amenities
    } else if (pathParts[0] === "properties") {
      // Extract hash from URL
      const hash = pathParts[1];

      // Lookup property ID from hash
      propertyId = await UploadBridge.getPropertyIdFromHash(hash);

      if (!propertyId) {
        return NextResponse.json(
          { error: "Invalid file path" },
          { status: 404 }
        );
      }

      // Reconstruct actual file path with real propertyId
      const remainingParts = pathParts.slice(2); // Remove "properties" and hash
      actualFilePath = path.join("properties", propertyId, ...remainingParts);

      // Check access permissions
      if (remainingParts[0] === "kyc") {
        // KYC files require authentication
        requiresAuth = true;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const property = await Property.findById(propertyId);
        hasAccess =
          property &&
          (property.ownerId.toString() === session.user.id ||
            session.user.role === "admin" ||
            session.user.role === "sub-admin");
      } else {
        // Property images/videos - public access
        hasAccess = true;
      }
    }

    // Use external directory with actual file path
    const fullPath = path.join(UPLOAD_CONFIG.baseDir, actualFilePath);

    // Security check: Prevent directory traversal attacks
    if (!fullPath.startsWith(UPLOAD_CONFIG.baseDir)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists using async access
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get file info using async stat
    const stat = await fs.promises.stat(fullPath);
    const fileSize = stat.size;

    // Determine content type
    let contentType = "application/octet-stream";
    const ext = path.extname(fullPath).toLowerCase();

    const mimeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".tiff": "image/tiff",
      ".tif": "image/tiff",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".wmv": "video/x-ms-wmv",
      ".mkv": "video/x-matroska",
      ".flv": "video/x-flv",
      ".webm": "video/webm",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".rtf": "application/rtf",
    };

    contentType = mimeMap[ext] || contentType;

    // Create a readable stream for the file
    const fileStream = fs.createReadStream(fullPath);

    // Convert Node.js ReadStream to Web ReadableStream
    // Next.js 16 NextResponse accepts ReadableStream or BodyInit
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    // Return file with security headers
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Cache-Control":
          pathParts[0] === "properties"
            ? "public, max-age=31536000, immutable"
            : "private, no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
