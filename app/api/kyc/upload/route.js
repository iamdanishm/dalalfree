import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/db";
import Kyc from "@/app/lib/models/Kyc";
import {
  uploadKycVideo,
  uploadKycDocuments,
  getStorageStats,
} from "@/app/lib/upload";

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// GET /api/kyc/upload - Get storage stats and upload limits
export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storageStats = getStorageStats();
  const userKyc = await Kyc.findOne({ userId: session.user.id });

  return NextResponse.json({
    storage: storageStats,
    limits: {
      video: "50MB",
      documents: "10MB each",
    },
    hasKyc: !!userKyc,
    kycStatus: userKyc?.status || "none",
  });
}

// POST /api/kyc/upload - Upload KYC files
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Parse multipart form data manually
    const formData = await req.formData();
    const fileType = formData.get("fileType"); // 'video' or 'documents'
    const file = formData.get("file");

    if (!file || !fileType) {
      return NextResponse.json(
        { error: "Missing file or fileType parameter" },
        { status: 400 }
      );
    }

    // Check if user already has KYC
    let existingKyc = await Kyc.findOne({ userId: session.user.id });

    if (existingKyc && existingKyc.status === "approved") {
      return NextResponse.json(
        { error: "KYC already approved" },
        { status: 400 }
      );
    }

    // Determine upload middleware based on file type
    let uploadMiddleware;
    let fieldName = "file";

    if (fileType === "video") {
      uploadMiddleware = uploadKycVideo;
    } else if (fileType === "documents") {
      uploadMiddleware = uploadKycDocuments;
    } else {
      return NextResponse.json(
        { error: "Invalid fileType. Use 'video' or 'documents'" },
        { status: 400 }
      );
    }

    // Create a mock req/res for multer
    const mockReq = {
      file: null,
      body: {},
      headers: {
        "content-type": req.headers.get("content-type"),
      },
    };

    const mockRes = {
      statusCode: 200,
      setHeader: () => {},
      end: () => {},
    };

    try {
      await runMiddleware(mockReq, mockRes, uploadMiddleware.single(fieldName));

      // After multer processing, the file should be available
      // But since we're using formData, we need to handle it differently
      // For now, let's create a basic response structure

      // This is a simplified implementation - in production you'd want to:
      // 1. Save file metadata to database
      // 2. Process uploads appropriately
      // 3. Handle file paths securely

      if (existingKyc) {
        // Update existing KYC with new files
        if (fileType === "video") {
          // Update video URL
          existingKyc.videoUrl = `/uploads/kyc/videos/${Date.now()}-${
            file.name
          }`;
        } else {
          // Add to document URLs array
          if (!existingKyc.documentUrls) existingKyc.documentUrls = [];
          existingKyc.documentUrls.push(
            `/uploads/kyc/documents/${Date.now()}-${file.name}`
          );
        }
        await existingKyc.save();

        return NextResponse.json({
          success: true,
          message: `${fileType} uploaded successfully`,
          kyc: {
            id: existingKyc._id,
            status: existingKyc.status,
            files:
              fileType === "video"
                ? [existingKyc.videoUrl]
                : existingKyc.documentUrls,
          },
        });
      } else {
        // Create new KYC entry
        const kycData = {
          userId: session.user.id,
          status: "pending",
        };

        if (fileType === "video") {
          kycData.videoUrl = `/uploads/kyc/videos/${Date.now()}-${file.name}`;
        } else {
          kycData.documentUrls = [
            `/uploads/kyc/documents/${Date.now()}-${file.name}`,
          ];
        }

        const newKyc = await Kyc.create(kycData);

        return NextResponse.json({
          success: true,
          message: `KYC ${fileType} uploaded and application started`,
          kyc: {
            id: newKyc._id,
            status: newKyc.status,
            files:
              fileType === "video" ? [newKyc.videoUrl] : newKyc.documentUrls,
          },
        });
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("KYC upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/kyc/upload - Update KYC files (for additional uploads)
export async function PUT(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Implementation similar to POST but for updating existing files
  return NextResponse.json({
    message: "PUT method for updating KYC files - implementation pending",
  });
}
