import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAdmin } from "@/app/lib/auth";
import { PropertyService } from "@/app/lib/services/PropertyService";
import { handleApiError, AppError } from "@/app/lib/utils/errors";

export const PUT = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    const updateData = await req.json();

    // Delegate status changes and side effects to PropertyService
    const property = await PropertyService.updateStatus(id, req.user.id, updateData);

    return NextResponse.json({
      success: true,
      property,
      message: "Property updated successfully"
    });

  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    const { reason } = await req.json();

    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError("Property not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Property permanently deleted"
    });

  } catch (error) {
    return handleApiError(error);
  }
});

export const GET = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    const property = await Property.findById(id)
      .populate("ownerId", "name email phone role isVerified")
      .populate("approvedBy", "name email")
      .populate("societyAmenities", "name title icon image category");

    if (!property) {
      throw new AppError("Property not found", 404);
    }

    return NextResponse.json({
      success: true,
      property
    });

  } catch (error) {
    return handleApiError(error);
  }
});

