import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import Property from "@/app/lib/models/Property";
import path from "path";
import fs from "fs";

// Secure file serving API with access control
export async function GET(req, { params }) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filePath = params.path.join("/");
    const fullPath = path.join(process.cwd(), "uploads", filePath);

    // Security check: Prevent directory traversal attacks
    if (
      fullPath !== path.resolve(process.cwd(), "uploads", filePath) ||
      !fullPath.startsWith(path.join(process.cwd(), "uploads"))
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file info
    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;

    // Parse file type from path
    const fileType = filePath.split("/")[0]; // kyc or properties
    const subType = filePath.split("/")[1]; // videos, documents, images

    let hasAccess = false;

    if (
      fileType === "kyc" &&
      (session.user.role === "admin" || session.user.role === "sub-admin")
    ) {
      // Admin access to all KYC files
      hasAccess = true;
    } else if (fileType === "kyc") {
      // User access to their own KYC files
      const userKyc = await Kyc.findOne({ userId: session.user.id });
      if (userKyc) {
        // Check if file URL matches user's KYC files
        const videoUrl =
          subType === "videos"
            ? `/uploads/kyc/videos/${path.basename(filePath)}`
            : null;
        const docUrl =
          subType === "documents"
            ? `/uploads/kyc/documents/${path.basename(filePath)}`
            : null;

        if (
          (videoUrl && userKyc.videoUrl === videoUrl) ||
          (docUrl &&
            userKyc.documentUrls &&
            userKyc.documentUrls.includes(docUrl))
        ) {
          hasAccess = true;
        }
      }
    } else if (fileType === "properties") {
      // Property file access - check property ownership
      const propertyId = filePath.split("/")[2]; // Assuming future path structure: properties/images/PROPERTY_ID/filename
      if (propertyId) {
        const property = await Property.findOne({
          _id: propertyId,
          $or: [
            { ownerId: session.user.id }, // Owner can access
            // Admin can access all
          ],
        });

        if (
          property ||
          session.user.role === "admin" ||
          session.user.role === "sub-admin"
        ) {
          hasAccess = true;
        }
      } else {
        // For now, allow access if file exists in property directory (simplified)
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(fullPath);

    // Determine content type
    let contentType = "application/octet-stream";
    const ext = path.extname(fullPath).toLowerCase();

    if (
      [".jpg", ".jpeg", ".png", ".gif", ".webp", ".tiff", ".tif"].includes(ext)
    ) {
      contentType = `image/${ext.slice(1)}`;
    } else if (
      [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".flv", ".webm"].includes(ext)
    ) {
      contentType = `video/${ext.slice(1)}`;
    } else if ([".pdf", ".doc", ".docx", ".txt", ".rtf"].includes(ext)) {
      contentType = `application/${ext.slice(1)}`;
      if (ext === ".docx")
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Return file with security headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Cache-Control":
          fileType === "properties"
            ? "public, max-age=31536000"
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
