import { NextResponse } from "next/server.js";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";
import { validatePropertyData } from "@/app/lib/propertyHelpers";

// Import helper modules
import {
  transformSocietyAmenities,
  transformNearbyPlacesToAmenities,
} from "./helpers/amenities";
import { processFileUploads } from "./helpers/fileProcessing";
import {
  categorizeKycDocuments,
  transformKycFilesToDatabaseStructure,
  validateKycCompleteness,
} from "./helpers/kycProcessing";

// Main property creation handler
export const POST = requireAuth(async function (req) {
  try {
    await connectDB();

    const userId = req.user._id;
    const role = req.user.role;

    // Check user permissions
    if (role !== "partner" && role !== "user") {
      return NextResponse.json(
        { error: "Only partners and users can list properties" },
        { status: 403 }
      );
    }

    // Parse multipart form data
    let formData;
    try {
      formData = await req.formData();
      console.log("✓ FormData parsed successfully");
      console.log("FormData keys:", Array.from(formData.keys()));
    } catch (error) {
      console.error("✗ FormData parsing failed:", error);
      // If formData parsing fails, check if it's an empty request
      const contentType = req.headers.get("content-type");
      if (
        !contentType ||
        (!contentType.includes("multipart/form-data") &&
          !contentType.includes("application/x-www-form-urlencoded"))
      ) {
        console.log(
          "Empty request detected, returning validation requirements"
        );
        // Return required fields for empty requests
        const emptyData = {};
        const validationErrors = validatePropertyData(emptyData);

        // Add file field validation errors for empty requests
        validationErrors.images = {
          message: "At least one property image is required",
          type: "file[]",
        };
        validationErrors.kycFiles = {
          message: "KYC documents are required for property verification",
          type: "object",
          requiredKeys: ["aadhaar", "pan", "agreement", "video"],
          details: {
            aadhaar: "Aadhaar document is required",
            pan: "PAN document is required",
            agreement: "Property agreement document is required",
            video: "KYC verification video is required",
          },
        };

        return NextResponse.json(
          {
            error: "Validation failed",
            message: "Required fields are missing",
            details: validationErrors,
            requiredFields: [
              "title",
              "propertyType",
              "category",
              "address",
              "location",
              "city",
              "state",
              "pincode",
              "description",
              "builtUpArea",
              "carpetArea",
              "floor",
              "age",
              "parking",
              "facing",
              "possessionStatus",
              "coordinates",
              "price",
              "images",
              "kycFiles",
            ],
          },
          { status: 400 }
        );
      }
      // Re-throw other parsing errors
      throw error;
    }

    // Extract text data
    const textData = {};
    const fileFields = {};

    console.log("=== PARSING FORM DATA ===");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file fields
        if (!fileFields[key]) fileFields[key] = [];
        fileFields[key].push(value);
        console.log(
          `File field "${key}":`,
          value.name,
          `(${value.size} bytes, ${value.type})`
        );
      } else {
        // Handle text fields
        console.log(`Text field "${key}":`, value);
        try {
          // Try to parse as JSON for complex objects
          textData[key] = JSON.parse(value);
          console.log(`✓ Parsed "${key}" as JSON:`, textData[key]);
        } catch {
          // Keep as string if not JSON
          textData[key] = value;
          console.log(`✓ Kept "${key}" as string:`, textData[key]);
        }
      }
    }

    // Validate required data (text fields only, file validation separate)
    const validation = validatePropertyData(textData);
    const validationErrors = validation.errors;

    // Add file field validation (override the propertyHelpers validation for files)
    if (!fileFields.images || fileFields.images.length === 0) {
      validationErrors.images = "At least one property image is required";
    } else {
      // Remove the images error from propertyHelpers since we have files
      delete validationErrors.images;
    }

    if (!fileFields.kycFiles || fileFields.kycFiles.length < 4) {
      validationErrors.kycFiles = `KYC documents incomplete. Found ${
        fileFields.kycFiles?.length || 0
      }, need 4 (Aadhaar, PAN, Agreement, Video)`;
    } else {
      // Remove the kycFiles error from propertyHelpers since we have files
      delete validationErrors.kycFiles;
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Generate unique slug
    console.log("=== SLUG GENERATION ===");
    const slug =
      textData.slug || (await generateUniquePropertySlug(textData.title));
    console.log("Generated slug:", slug);

    // Transform data for database (without files initially)
    console.log("=== PROPERTY DATA TRANSFORMATION ===");
    const propertyData = {
      ownerId: userId,
      title: textData.title,
      slug,
      description: textData.description,
      subtitle: textData.subtitle,
      price: parseFloat(textData.price) || 0,
      marketRange: textData.marketRange,
      negotiable: textData.negotiable || "No",
      propertyType: textData.propertyType,
      category: textData.category,

      // Specifications
      bhk: textData.bhk,
      bathrooms: textData.bathrooms ? parseInt(textData.bathrooms) : undefined,
      balcony: textData.balcony ? parseInt(textData.balcony) : undefined,
      furnishing: textData.furnishing,
      builtUpArea: parseFloat(textData.builtUpArea),
      carpetArea: parseFloat(textData.carpetArea),
      floor: textData.floor,
      totalFloors: textData.totalFloors
        ? parseInt(textData.totalFloors)
        : undefined,
      age: parseInt(textData.age),
      ageUnit: textData.ageUnit || "years old",
      parking: textData.parking,
      facing: textData.facing,
      possessionStatus: textData.possessionStatus,
      // Only save maintenance for rent properties or commercial properties
      maintenance: ((textData.category === "Residential" && textData.propertyType === "rent") ||
                   textData.category === "Commercial") ? textData.maintenance : undefined,

      // Location
      location: textData.location,
      address: textData.address,
      city: textData.city,
      state: textData.state,
      pincode: textData.pincode,
      coordinates: textData.coordinates,

      // User selections
      highlights: Array.isArray(textData.highlights) ? textData.highlights : [],
      societyAmenities: Array.isArray(textData.societyAmenities)
        ? textData.societyAmenities
        : [],
      nearbyPlaces: Array.isArray(textData.nearbyPlaces)
        ? textData.nearbyPlaces
        : [],

      // Status
      status: "pending", // Requires admin approval
      verified: false,
    };

    console.log("Property data prepared:", {
      title: propertyData.title,
      propertyType: propertyData.propertyType,
      category: propertyData.category,
      price: propertyData.price,
      highlightsCount: propertyData.highlights.length,
      societyAmenitiesCount: propertyData.societyAmenities.length,
      nearbyPlacesCount: propertyData.nearbyPlaces.length,
    });

    // Transform amenities data
    console.log("=== AMENITIES TRANSFORMATION ===");
    propertyData.amenities = {
      society: await transformSocietyAmenities(propertyData.societyAmenities),
      nearby: transformNearbyPlacesToAmenities(propertyData.nearbyPlaces),
    };
    console.log("Amenities transformed:", {
      societyCount: propertyData.amenities.society.length,
      nearbyCount: propertyData.amenities.nearby.length,
    });

    // Create property record first to get propertyId
    console.log("=== PROPERTY CREATION ===");
    const property = await Property.create(propertyData);
    const propertyId = property._id.toString();

    // Generate and store secure hash for file URLs
    const { UploadBridge } = await import("@/app/lib/upload-bridge.js");
    const fileHash = UploadBridge.generatePropertyHash(propertyId);

    // Update property with hash
    await Property.findByIdAndUpdate(propertyId, { fileHash });
    console.log(
      "✓ Property created with ID:",
      propertyId,
      "and hash:",
      fileHash
    );

    // Process file uploads with propertyId
    console.log("=== FILE PROCESSING ===");
    const fileProcessingResults = await processFileUploads(
      fileFields,
      propertyData,
      propertyId
    );
    console.log("File processing results:", fileProcessingResults.stats);

    // Update property with file URLs
    if (fileProcessingResults.files) {
      console.log("=== PROPERTY UPDATE WITH FILES ===");

      // Transform KYC files to match schema structure
      const kycFilesData = fileProcessingResults.files?.kycFiles || {};
      const documents = kycFilesData.documents || [];
      const videos = kycFilesData.videos || [];

      console.log("KYC categorization debug:");
      console.log(
        "- Documents:",
        documents.map((d) => ({ name: d.name, type: d.type }))
      );
      console.log(
        "- Videos:",
        videos.map((v) => ({ name: v.name, type: v.type }))
      );

      // Use KYC processing helpers
      const categorizedDocs = categorizeKycDocuments(documents);
      const kycFilesForDB = transformKycFilesToDatabaseStructure(
        categorizedDocs,
        videos
      );

      // Validate KYC completeness
      const kycValidation = validateKycCompleteness(kycFilesForDB);
      if (!kycValidation.complete) {
        console.warn("KYC validation warning:", kycValidation.message);
      }

      await Property.findByIdAndUpdate(propertyId, {
        images: fileProcessingResults.files.images || [],
        videos: fileProcessingResults.files.videos || [],
        kycFiles: kycFilesForDB,
      });
      console.log("✓ Property updated with file URLs");
      console.log("KYC files saved:", {
        aadhaar: kycFilesForDB.aadhaar.length,
        pan: kycFilesForDB.pan ? 1 : 0,
        agreement: kycFilesForDB.agreement ? 1 : 0,
        video: kycFilesForDB.video ? 1 : 0,
      });
    }

    console.log("=== API RESPONSE ===");
    return NextResponse.json({
      success: true,
      message: "Property created successfully",
      property: {
        id: property._id,
        slug: property.slug,
        title: property.title,
        status: property.status,
        files: fileProcessingResults,
      },
    });
  } catch (error) {
    console.error("Property creation error:", error);

    // Handle specific error types
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate property",
          message:
            "A property with this title already exists. Please choose a different title.",
          code: "DUPLICATE_PROPERTY",
        },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Please check your input and try again.",
          details: validationErrors,
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Handle file upload specific errors
    if (error.message?.includes("File")) {
      return NextResponse.json(
        {
          error: "File upload failed",
          message:
            "Some files could not be uploaded. Please try again or contact support.",
          details: error.message,
          code: "FILE_UPLOAD_ERROR",
        },
        { status: 422 }
      );
    }

    // Handle disk space errors
    if (error.code === "ENOSPC") {
      return NextResponse.json(
        {
          error: "Storage full",
          message: "Server storage is full. Please contact support.",
          code: "STORAGE_FULL",
        },
        { status: 507 }
      );
    }

    // Handle permission errors
    if (error.code === "EACCES" || error.code === "EPERM") {
      return NextResponse.json(
        {
          error: "Permission denied",
          message: "Unable to save files. Please contact support.",
          code: "PERMISSION_ERROR",
        },
        { status: 500 }
      );
    }

    // Handle network/database connection errors
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: "Unable to connect to database. Please try again later.",
          code: "DATABASE_ERROR",
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Property creation failed",
        message:
          "An unexpected error occurred. Please try again or contact support if the problem persists.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
});