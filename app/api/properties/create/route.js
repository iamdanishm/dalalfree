import { NextResponse } from "next/server.js";
import { connectDB } from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { validatePropertyData } from "@/app/lib/propertyHelpers";
import { PropertyService } from "@/app/lib/services/PropertyService";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export const POST = requireAuth(async function (req) {
  try {
    await connectDB();
    const userId = req.user._id;

    // 1. Parse FormData
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      throw new AppError("Invalid multipart form data", 400);
    }

    const textData = {};
    const fileFields = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (!fileFields[key]) fileFields[key] = [];
        fileFields[key].push(value);
      } else {
        try {
          textData[key] = JSON.parse(value);
        } catch {
          textData[key] = value;
        }
      }
    }

    // 2. Validate Data
    const validation = validatePropertyData(textData);
    if (Object.keys(validation.errors).length > 0) {
      throw new AppError("Validation failed", 400, validation.errors);
    }

    if (!fileFields.images?.length) {
      throw new AppError("At least one property image is required", 400);
    }

    if (!fileFields.kycFiles?.length || fileFields.kycFiles.length < 4) {
      throw new AppError("KYC documents incomplete (Aadhaar, PAN, Agreement, Video required)", 400);
    }

    // 3. Delegate to Service Layer
    const result = await PropertyService.createProperty(textData, fileFields, userId);

    return NextResponse.json({
      success: true,
      message: "Property created successfully",
      property: result,
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
});