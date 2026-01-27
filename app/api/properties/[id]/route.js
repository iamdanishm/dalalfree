import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";

// Import helper modules

import {
  transformSocietyAmenities,
  transformNearbyPlacesToAmenities,
} from "../create/helpers/amenities";
import { processFileUploads } from "../create/helpers/fileProcessing";
import {
  categorizeKycDocuments,
  transformKycFilesToDatabaseStructure,
  validateKycCompleteness,
} from "../create/helpers/kycProcessing";
import { validatePropertyData } from "@/app/lib/propertyHelpers";

// GET single property
export async function GET(_, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Find property by ID or slug
    let property;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid MongoDB ObjectId format
      property = await Property.findById(id)
        .populate({
          path: "amenities.society",
          model: "Amenity",
          select: "title",
        })
        .select("-partnerCommission -commissionPaid -commissionPaidDate -commissionTransactionId");
    } else {
      // Otherwise, try to find by slug
      property = await Property.findOne({ slug: id })
        .populate({
          path: "amenities.society",
          model: "Amenity",
          select: "title",
        })
        .select("-partnerCommission -commissionPaid -commissionPaidDate -commissionTransactionId");
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property: property.toObject(),
    });
  } catch (error) {
    console.error("Error fetching property:", error);

    // Handle MongoDB ObjectId errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, error: "Invalid property ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update property
export const PUT = requireAuth(async function (req, { params }) {
  await connectDB();

  const { id } = await params;
  const userId = req.user._id;
  const role = req.user.role;

  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if current user is owner or admin
  if (property.ownerId.toString() !== userId.toString() && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse multipart form data or JSON
  let textData = {};
  let fileFields = {};
  const contentType = req.headers.get("content-type");

  if (contentType && contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
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
  } else {
    textData = await req.json();
  }

  // Initialize updateData from textData
  let updateData = { ...textData };

  // Only save maintenance for rent properties or commercial properties
  if (updateData.maintenance !== undefined) {
    const shouldHaveMaintenance = (
      (updateData.category === "Residential" && updateData.propertyType === "rent") ||
      updateData.category === "Commercial"
    );
    if (!shouldHaveMaintenance) {
      updateData.maintenance = undefined;
    }
  }

  // Handle removed files - filter out removed items from existing arrays
  const existingImages = property.images || [];
  const existingVideos = property.videos || [];

  if (textData.removedImages && Array.isArray(textData.removedImages)) {
    updateData.images = existingImages.filter(
      (img) => !textData.removedImages.includes(img.url)
    );
  } else {
    updateData.images = [...existingImages];
  }

  if (textData.removedVideos && Array.isArray(textData.removedVideos)) {
    updateData.videos = existingVideos.filter(
      (vid) => !textData.removedVideos.includes(vid.url)
    );
  } else {
    updateData.videos = [...existingVideos];
  }

  // Transform society amenities and nearby places to correct database structure
  if (textData.societyAmenities !== undefined) {
    // Transform society amenities IDs to full objects
    const societyAmenityObjects = await transformSocietyAmenities(textData.societyAmenities || []);
    updateData.amenities = updateData.amenities || {};
    updateData.amenities.society = societyAmenityObjects;
    // Keep the simple array for backward compatibility if needed
    updateData.societyAmenities = textData.societyAmenities;
  } else {
    // Preserve existing society amenities if not being updated
    if (property.amenities?.society && property.amenities.society.length > 0) {
      updateData.amenities = updateData.amenities || {};
      updateData.amenities.society = property.amenities.society;
    }
  }

  if (textData.nearbyPlaces !== undefined) {
    // Transform nearby places to amenities format
    const nearbyPlacesAmenities = transformNearbyPlacesToAmenities(textData.nearbyPlaces || []);
    updateData.amenities = updateData.amenities || {};
    updateData.amenities.nearby = nearbyPlacesAmenities;
    // Keep the direct array for backward compatibility if needed
    updateData.nearbyPlaces = textData.nearbyPlaces;
  }

  // Regenerate slug if title is being updated or if slug is provided
  if (textData.title || textData.slug) {
    const newSlug =
      textData.slug || (await generateUniquePropertySlug(textData.title, id));
    updateData.slug = newSlug;
  }

  // Handle file updates - replace with new uploads (same as KYC behavior)
  if (fileFields.images || fileFields.videos || fileFields.kycFiles) {
    const fileProcessingResults = await processFileUploads(
      fileFields,
      { ...property.toObject(), ...updateData },
      id
    );
    if (fileProcessingResults.files) {
      // Handle images and videos - replace existing with new uploads (same as KYC)
      if (fileProcessingResults.files.images?.length > 0) {
        // Replace all existing images with new uploads
        updateData.images = fileProcessingResults.files.images;
      }

      if (fileProcessingResults.files.videos?.length > 0) {
        // Replace all existing videos with new uploads
        updateData.videos = fileProcessingResults.files.videos;
      }

      // Handle KYC files - merge intelligently with existing files
      const kycFilesData = fileProcessingResults.files?.kycFiles || {};
      const documents = kycFilesData.documents || [];
      const videos = kycFilesData.videos || [];
      const categorizedDocs = categorizeKycDocuments(documents);
      const newKycFiles = transformKycFilesToDatabaseStructure(
        categorizedDocs,
        videos
      );

      // Get existing KYC files from the property
      const existingKycFiles = property.kycFiles || {};

      // Merge KYC files: new files replace existing ones of the same type
      updateData.kycFiles = {
        ...existingKycFiles, // Keep all existing files
        ...newKycFiles,      // Override with new files (replacement logic)
      };
    }
  }

  const updated = await Property.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return NextResponse.json({ success: true, property: updated });
});

// DELETE property
export const DELETE = requireAuth(async function (req, { params }) {
  await connectDB();

  const { id } = await params;
  const userId = req.user._id;
  const role = req.user.role;

  const property = await Property.findById(id);
  if (!property)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (property.ownerId.toString() !== userId.toString() && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Property.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
});