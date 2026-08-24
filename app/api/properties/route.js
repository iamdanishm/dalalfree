import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { PropertyService } from "@/app/lib/services/PropertyService";
import { propertySearchSchema } from "@/app/lib/validations/property";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

// GET all properties with search/filter functionality
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // 1. Validate with Zod
    const validation = propertySearchSchema.safeParse(params);
    if (!validation.success) {
      throw new AppError("Invalid search parameters", 400, formatZodErrors(validation.error));
    }

    // 2. Delegate to Service Layer
    const result = await PropertyService.searchProperties(validation.data);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return handleApiError(error);
  }
}


// POST new property
export const POST = requireAuth(async function (req) {
  try {
    await connectDB();
    const body = await req.json();

    // Delegate to Service Layer (includes slug generation and defaults)
    const property = await PropertyService.createProperty(req.user.id, body);

    return NextResponse.json({
        success: true,
        property,
        message: "Property submitted for approval"
    });
  } catch (error) {
    return handleApiError(error);
  }
});

