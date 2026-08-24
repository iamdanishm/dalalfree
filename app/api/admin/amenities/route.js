import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth";
import { AmenityService } from "@/app/lib/services/AmenityService";
import { handleApiError } from "@/app/lib/utils/errors";

// GET /api/admin/amenities - Get paginated list of amenities
export const GET = requireAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      page: parseInt(searchParams.get("page")) || 1,
      limit: parseInt(searchParams.get("limit")) || 10,
      search: searchParams.get("search")
    };

    const result = await AmenityService.listAmenities(params);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// POST /api/admin/amenities - Create new amenity with image upload
export const POST = requireAdmin(async (req) => {
  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const available = formData.get("available") === "true";
    const imageFile = formData.get("image");

    const amenity = await AmenityService.createAmenity({ title, available }, imageFile);

    return NextResponse.json({
      success: true,
      message: "Amenity created successfully",
      amenity
    });
  } catch (error) {
    return handleApiError(error);
  }
});


