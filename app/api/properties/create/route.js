import { NextResponse } from "next/server.js";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";
import fs from "fs";
import path from "path";

// Amenity mapping for transforming IDs to full objects
const amenityMap = {
  "24-7-security": {
    name: "24/7 Security",
    category: "safety",
    icon: "FiShield",
  },
  cctv: { name: "CCTV Surveillance", category: "safety", icon: "FiVideo" },
  intercom: { name: "Intercom", category: "safety", icon: "FiPhone" },
  "fire-safety": {
    name: "Fire Safety",
    category: "safety",
    icon: "FiAlertTriangle",
  },
  "gated-community": {
    name: "Gated Community",
    category: "safety",
    icon: "FiLock",
  },
  "power-backup": {
    name: "Power Backup",
    category: "utilities",
    icon: "FiZap",
  },
  "water-supply": {
    name: "24/7 Water Supply",
    category: "utilities",
    icon: "FiDroplets",
  },
  lift: { name: "Lift/Elevator", category: "convenience", icon: "FiArrowUp" },
  parking: { name: "Parking Space", category: "convenience", icon: "FiCar" },
  "waste-management": {
    name: "Waste Management",
    category: "utilities",
    icon: "FiTrash",
  },
  "swimming-pool": {
    name: "Swimming Pool",
    category: "recreational",
    icon: "FaSwimmingPool",
  },
  gym: { name: "Gym/Fitness Center", category: "fitness", icon: "FaDumbbell" },
  "children-play-area": {
    name: "Children's Play Area",
    category: "family",
    icon: "FiStar",
  },
  garden: {
    name: "Garden/Landscaped Area",
    category: "recreational",
    icon: "FaTree",
  },
  "club-house": {
    name: "Club House",
    category: "recreational",
    icon: "FiHome",
  },
  "jogging-track": {
    name: "Jogging Track",
    category: "fitness",
    icon: "FiActivity",
  },
  "visitor-parking": {
    name: "Visitor Parking",
    category: "convenience",
    icon: "FiCar",
  },
  "maintenance-staff": {
    name: "Maintenance Staff",
    category: "services",
    icon: "FiUser",
  },
  laundry: { name: "Laundry Service", category: "services", icon: "FiShirt" },
  housekeeping: { name: "Housekeeping", category: "services", icon: "FiHome" },
  wifi: { name: "Wi-Fi Connectivity", category: "technology", icon: "FiWifi" },
  "ro-water": {
    name: "RO Water System",
    category: "utilities",
    icon: "FiDroplets",
  },
  "solar-panels": { name: "Solar Panels", category: "eco", icon: "FiSun" },
  "rain-water-harvesting": {
    name: "Rain Water Harvesting",
    category: "eco",
    icon: "FiCloudRain",
  },
  "senior-citizen-area": {
    name: "Senior Citizen Area",
    category: "family",
    icon: "FiUsers",
  },
  "meditation-area": {
    name: "Meditation/Yoga Area",
    category: "wellness",
    icon: "FiHeart",
  },
};

// Helper function to transform society amenities IDs to full objects
function transformSocietyAmenities(amenityIds) {
  if (!Array.isArray(amenityIds)) return [];

  return amenityIds
    .map((id) => amenityMap[id])
    .filter(Boolean)
    .map((amenity) => ({
      name: amenity.name,
      available: true,
      icon: amenity.icon,
    }));
}

// Helper function to transform nearby places to amenities format
function transformNearbyPlacesToAmenities(nearbyPlaces) {
  if (!Array.isArray(nearbyPlaces)) return [];

  return nearbyPlaces.map((place) => ({
    name: place.name,
    distance: place.distance,
    rating: place.rating || 0,
    icon: getNearbyPlaceIcon(place.type),
    category: place.type,
  }));
}

// Helper function to get icon for nearby place types
function getNearbyPlaceIcon(type) {
  const iconMap = {
    school: "FaGraduationCap",
    hospital: "FaHospital",
    mall: "FaShoppingBag",
    metro: "FaSubway",
    "bus-stop": "FaBus",
    restaurant: "FaUtensils",
    park: "FaTree",
    bank: "FaUniversity",
    supermarket: "FaShoppingCart",
  };
  return iconMap[type] || "FiMapPin";
}

// Validation helper
function validatePropertyData(data, fileFields = {}) {
  const errors = {};

  // Required fields validation
  const requiredFields = [
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
  ];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors[field] = {
        message: `${field} is required`,
        type: "string",
      };
    }
  });

  // Numeric field validations
  const numericFields = ["builtUpArea", "carpetArea", "age"];
  numericFields.forEach((field) => {
    if (data[field] && (isNaN(data[field]) || data[field] <= 0)) {
      errors[field] = {
        message: `${field} must be a positive number`,
        type: "number",
      };
    }
  });

  // Coordinates validation
  if (!data.coordinates || !data.coordinates.lat || !data.coordinates.lng) {
    errors.coordinates = {
      message: "Coordinates are required",
      type: "object",
    };
  }

  // BHK validation for residential
  if (data.category === "Residential" && !data.bhk) {
    errors.bhk = {
      message: "BHK is required for residential properties",
      type: "string",
    };
  }

  // Price validation
  if (!data.price || isNaN(data.price) || data.price <= 0) {
    errors.price = {
      message: "Price is required and must be a positive number",
      type: "number",
    };
  }

  // File field validations
  if (!fileFields.images || fileFields.images.length === 0) {
    errors.images = {
      message: "At least one property image is required",
      type: "file[]",
    };
  }

  // Video field validation (optional - commented out to allow property creation without videos)
  // Users can choose to upload videos or rely on images only
  // if (!fileFields.videos || fileFields.videos.length === 0) {
  //   errors.videos = {
  //     message: "At least one property video is required",
  //     type: "file[]",
  //   };
  // }

  // KYC files validation - all files are in kycFiles array
  if (!fileFields.kycFiles || fileFields.kycFiles.length === 0) {
    errors.kycFiles = {
      message: "KYC documents are required for property verification",
      type: "array",
      requiredCount: 4,
      details:
        "At least 4 KYC documents are required (Aadhaar, PAN, Agreement, Video)",
    };
  } else if (fileFields.kycFiles.length < 4) {
    errors.kycFiles = {
      message: `KYC documents incomplete. Found ${fileFields.kycFiles.length}, need 4`,
      type: "array",
      requiredCount: 4,
      currentCount: fileFields.kycFiles.length,
      details:
        "Required: Aadhaar document(s), PAN card, Property agreement, and KYC video",
    };
  }

  return errors;
}

// Main property creation handler
export const POST = requireAuth(async function (req) {
  console.log("=== PROPERTY CREATION API START ===");
  console.log("Request method:", req.method);
  console.log("Content-Type:", req.headers.get("content-type"));
  console.log("User ID:", req.user._id);
  console.log("User role:", req.user.role);

  try {
    await connectDB();
    console.log("✓ Database connected");

    const userId = req.user._id;
    const role = req.user.role;

    // Check user permissions
    if (role !== "partner" && role !== "user") {
      console.log("✗ Permission denied - invalid role:", role);
      return NextResponse.json(
        { error: "Only partners and users can list properties" },
        { status: 403 }
      );
    }
    console.log("✓ User permissions validated");

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
        validationErrors.videos = {
          message: "At least one property video is required",
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
              "videos",
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

    console.log("=== VALIDATION PHASE ===");
    console.log("Text data received:", Object.keys(textData));
    console.log("File fields received:", Object.keys(fileFields));

    // Validate required data
    const validationErrors = validatePropertyData(textData, fileFields);
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.log("✗ Validation failed, returning errors");
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }
    console.log("✓ Validation passed");

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
      maintenance: textData.maintenance,

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
      society: transformSocietyAmenities(propertyData.societyAmenities),
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
    console.log("✓ Property created with ID:", propertyId);

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

      // Smart KYC file categorization based on file names and types
      const kycFilesForDB = {};

      // Helper function to categorize documents based on filename patterns
      const categorizeDocument = (doc) => {
        const name = doc.name.toLowerCase();
        const type = doc.type.toLowerCase();

        // Aadhaar patterns
        if (
          name.includes("aadhar") ||
          name.includes("aadh") ||
          name.includes("aadhaar")
        ) {
          return "aadhaar";
        }

        // PAN patterns
        if (
          name.includes("pan") ||
          name.includes("pancard") ||
          name.includes("pan card")
        ) {
          return "pan";
        }

        // Agreement patterns (PDFs are likely agreements)
        if (
          type === "application/pdf" ||
          name.includes("agreement") ||
          name.includes("contract") ||
          name.includes("deal") ||
          name.includes("property") ||
          name.includes("document")
        ) {
          return "agreement";
        }

        // Default to aadhaar for remaining images (assuming users upload aadhaar first)
        return "aadhaar";
      };

      // Categorize documents
      const categorizedDocs = {
        aadhaar: [],
        pan: null,
        agreement: null,
      };

      for (const doc of documents) {
        const category = categorizeDocument(doc);

        if (category === "aadhaar") {
          if (categorizedDocs.aadhaar.length < 2) {
            // Max 2 aadhaar files
            categorizedDocs.aadhaar.push(doc);
          }
        } else if (category === "pan" && !categorizedDocs.pan) {
          categorizedDocs.pan = doc;
        } else if (category === "agreement" && !categorizedDocs.agreement) {
          categorizedDocs.agreement = doc;
        }
      }

      // Assign to database structure
      if (categorizedDocs.aadhaar.length > 0) {
        kycFilesForDB.aadhaar = categorizedDocs.aadhaar;
      }
      if (categorizedDocs.pan) {
        kycFilesForDB.pan = categorizedDocs.pan;
      }
      if (categorizedDocs.agreement) {
        kycFilesForDB.agreement = categorizedDocs.agreement;
      }

      // Video is always the first video file
      if (videos.length >= 1) {
        kycFilesForDB.video = videos[0];
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

// File processing helper
async function processFileUploads(fileFields, propertyData, propertyId) {
  const results = {
    files: {},
    stats: {
      images: { uploaded: 0, failed: 0, errors: [] },
      videos: { uploaded: 0, failed: 0, errors: [] },
      kyc: { uploaded: 0, failed: 0, errors: [] },
    },
    hasPartialFailures: false,
    criticalFailures: false,
  };

  try {
    // Process images
    if (fileFields.images && fileFields.images.length > 0) {
      const imageResults = await processImages(fileFields.images, propertyId);
      results.files.images = imageResults.files;
      results.stats.images = imageResults.stats;

      if (imageResults.stats.failed > 0) {
        results.hasPartialFailures = true;
        results.stats.images.errors = imageResults.errors || [];
      }
    }

    // Process videos
    if (fileFields.videos && fileFields.videos.length > 0) {
      const videoResults = await processVideos(fileFields.videos, propertyId);
      results.files.videos = videoResults.files;
      results.stats.videos = videoResults.stats;

      if (videoResults.stats.failed > 0) {
        results.hasPartialFailures = true;
        results.stats.videos.errors = videoResults.errors || [];
      }
    }

    // Process KYC files - all KYC files are in kycFiles array
    if (fileFields.kycFiles && fileFields.kycFiles.length > 0) {
      const kycResults = await processKycFiles(fileFields.kycFiles, propertyId);
      results.files.kycFiles = kycResults.files;
      results.stats.kyc = kycResults.stats;

      if (kycResults.stats.failed > 0) {
        results.hasPartialFailures = true;
        results.stats.kyc.errors = kycResults.errors || [];
      }
    }

    // Check for critical failures (no files uploaded for required categories)
    if (results.stats.images.uploaded === 0 && fileFields.images?.length > 0) {
      results.criticalFailures = true;
    }
    if (results.stats.videos.uploaded === 0 && fileFields.videos?.length > 0) {
      results.criticalFailures = true;
    }
    if (results.stats.kyc.uploaded === 0 && fileFields.kycFiles) {
      results.criticalFailures = true;
    }
  } catch (error) {
    console.error("File processing error:", error);
    results.criticalFailures = true;
    results.error = error.message;
  }

  return results;
}

// Image processing helper
async function processImages(imageFiles, propertyId) {
  const files = [];
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(imageFiles.length, 20); i++) {
    const file = imageFiles[i];
    try {
      // Generate unique filename
      const extension = path.extname(file.name).toLowerCase();
      const uniqueName = `img-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}${extension}`;
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "properties",
        propertyId,
        "images",
        uniqueName
      );

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      files.push({
        id: `img-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/properties/${propertyId}/images/${uniqueName}`,
        category: "other",
        order: i,
        uploadedAt: new Date(),
      });

      uploaded++;
    } catch (error) {
      console.error(`Failed to process image ${file.name}:`, error);
      failed++;
      errors.push({
        file: file.name,
        error: error.message,
        code: error.code || "FILE_PROCESSING_ERROR",
      });
    }
  }

  return { files, stats: { uploaded, failed }, errors };
}

// Video processing helper
async function processVideos(videoFiles, propertyId) {
  const files = [];
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < Math.min(videoFiles.length, 5); i++) {
    const file = videoFiles[i];
    try {
      const extension = path.extname(file.name).toLowerCase();
      const uniqueName = `vid-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}${extension}`;
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "properties",
        propertyId,
        "videos",
        uniqueName
      );

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      files.push({
        id: `vid-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/properties/${propertyId}/videos/${uniqueName}`,
        order: i,
        uploadedAt: new Date(),
      });

      uploaded++;
    } catch (error) {
      console.error(`Failed to process video ${file.name}:`, error);
      failed++;
      errors.push({
        file: file.name,
        error: error.message,
        code: error.code || "FILE_PROCESSING_ERROR",
      });
    }
  }

  return { files, stats: { uploaded, failed }, errors };
}

// KYC file processing helper - handles array of KYC files
async function processKycFiles(kycFilesArray, propertyId) {
  const files = { documents: [], videos: [] };
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  try {
    // kycFilesArray is now an array of all KYC files
    for (let i = 0; i < Math.min(kycFilesArray.length, 10); i++) {
      const file = kycFilesArray[i];
      try {
        const isVideo = file.type.startsWith("video/");
        const folder = isVideo ? "videos" : "documents";

        // Determine file extension - for videos, use MIME type since browser recording may have "blob" as name
        let extension = path.extname(file.name).toLowerCase();
        if (isVideo && (!extension || file.name === "blob")) {
          // Map MIME types to extensions for videos
          const mimeToExt = {
            "video/webm": ".webm",
            "video/mp4": ".mp4",
            "video/avi": ".avi",
            "video/mov": ".mov",
            "video/wmv": ".wmv",
            "video/mkv": ".mkv",
            "video/flv": ".flv",
          };
          extension = mimeToExt[file.type] || ".webm"; // Default to .webm
        }

        const uniqueName = `kyc-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}${extension}`;
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "properties",
          propertyId,
          "kyc",
          folder,
          uniqueName
        );

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        const fileData = {
          url: `/uploads/properties/${propertyId}/kyc/${folder}/${uniqueName}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };

        if (isVideo) {
          fileData.duration = 15; // Default duration for KYC videos
          files.videos.push(fileData);
        } else {
          files.documents.push(fileData);
        }

        uploaded++;
      } catch (error) {
        console.error(`Failed to process KYC file ${file.name}:`, error);
        failed++;
        errors.push({
          file: file.name,
          error: error.message,
          code: error.code || "FILE_PROCESSING_ERROR",
        });
      }
    }
  } catch (error) {
    console.error("KYC file processing error:", error);
    failed++;
    errors.push({
      type: "general",
      error: error.message,
      code: error.code || "FILE_PROCESSING_ERROR",
    });
  }

  return { files, stats: { uploaded, failed }, errors };
}
