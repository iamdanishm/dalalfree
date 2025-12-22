import { NextResponse } from "next/server.js";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import Kyc from "@/app/lib/models/Kyc";
import { requireAuth } from "@/app/lib/auth";
import { generateUniquePropertySlug } from "@/app/lib/slug";
import {
  uploadPropertyImages,
  uploadPropertyVideos,
  uploadKycDocuments,
  uploadKycVideo,
} from "@/app/lib/upload";
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

  // Video field validation (required)
  if (!fileFields.videos || fileFields.videos.length === 0) {
    errors.videos = {
      message: "At least one property video is required",
      type: "file[]",
    };
  }

  // KYC files validation with specific document types
  if (!fileFields.kycFiles || Object.keys(fileFields.kycFiles).length === 0) {
    errors.kycFiles = {
      message: "KYC documents are required for property verification",
      type: "object",
      requiredKeys: ["aadhaar", "pan", "agreement", "video"],
    };
  } else {
    // Check for specific KYC document types
    const kycErrors = {};
    if (
      !fileFields.kycFiles.aadhaar ||
      fileFields.kycFiles.aadhaar.length === 0
    ) {
      kycErrors.aadhaar = "Aadhaar document is required";
    }
    if (!fileFields.kycFiles.pan || fileFields.kycFiles.pan.length === 0) {
      kycErrors.pan = "PAN document is required";
    }
    if (
      !fileFields.kycFiles.agreement ||
      fileFields.kycFiles.agreement.length === 0
    ) {
      kycErrors.agreement = "Property agreement document is required";
    }
    if (!fileFields.kycFiles.video || fileFields.kycFiles.video.length === 0) {
      kycErrors.video = "KYC verification video is required";
    }

    if (Object.keys(kycErrors).length > 0) {
      errors.kycFiles = {
        message: "KYC documents are required for property verification",
        type: "object",
        requiredKeys: ["aadhaar", "pan", "agreement", "video"],
        details: kycErrors,
      };
    }
  }

  return errors;
}

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
    } catch (error) {
      // If formData parsing fails, check if it's an empty request
      const contentType = req.headers.get("content-type");
      if (
        !contentType ||
        (!contentType.includes("multipart/form-data") &&
          !contentType.includes("application/x-www-form-urlencoded"))
      ) {
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

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file fields
        if (!fileFields[key]) fileFields[key] = [];
        fileFields[key].push(value);
      } else {
        // Handle text fields
        try {
          // Try to parse as JSON for complex objects
          textData[key] = JSON.parse(value);
        } catch {
          // Keep as string if not JSON
          textData[key] = value;
        }
      }
    }

    // Validate required data
    const validationErrors = validatePropertyData(textData, fileFields);
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
    const slug =
      textData.slug || (await generateUniquePropertySlug(textData.title));

    // Transform data for database
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

    // Transform amenities data
    propertyData.amenities = {
      society: transformSocietyAmenities(propertyData.societyAmenities),
      nearby: transformNearbyPlacesToAmenities(propertyData.nearbyPlaces),
    };

    // Process file uploads
    const fileProcessingResults = await processFileUploads(
      fileFields,
      propertyData
    );

    // Create property record
    const property = await Property.create(propertyData);

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
          message: "A property with this title already exists",
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
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create property",
        message: error.message,
      },
      { status: 500 }
    );
  }
});

// File processing helper
async function processFileUploads(fileFields, propertyData) {
  const results = {
    images: { uploaded: 0, failed: 0 },
    videos: { uploaded: 0, failed: 0 },
    kyc: { uploaded: 0, failed: 0 },
  };

  try {
    // Process images
    if (fileFields.images && fileFields.images.length > 0) {
      const imageResults = await processImages(fileFields.images);
      propertyData.images = imageResults.files;
      results.images = imageResults.stats;
    }

    // Process videos
    if (fileFields.videos && fileFields.videos.length > 0) {
      const videoResults = await processVideos(fileFields.videos);
      propertyData.videos = videoResults.files;
      results.videos = videoResults.stats;
    }

    // Process KYC files
    if (fileFields.kycFiles) {
      const kycResults = await processKycFiles(fileFields.kycFiles);
      propertyData.kycFiles = kycResults.files;
      results.kyc = kycResults.stats;
    }
  } catch (error) {
    console.error("File processing error:", error);
    // Continue with property creation even if file processing fails
  }

  return results;
}

// Image processing helper
async function processImages(imageFiles) {
  const files = [];
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
        url: `/uploads/properties/images/${uniqueName}`,
        category: "other",
        order: i,
        uploadedAt: new Date(),
      });

      uploaded++;
    } catch (error) {
      console.error(`Failed to process image ${file.name}:`, error);
      failed++;
    }
  }

  return { files, stats: { uploaded, failed } };
}

// Video processing helper
async function processVideos(videoFiles) {
  const files = [];
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
        url: `/uploads/properties/videos/${uniqueName}`,
        order: i,
        uploadedAt: new Date(),
      });

      uploaded++;
    } catch (error) {
      console.error(`Failed to process video ${file.name}:`, error);
      failed++;
    }
  }

  return { files, stats: { uploaded, failed } };
}

// KYC file processing helper
async function processKycFiles(kycFiles) {
  const files = { aadhaar: [], pan: null, agreement: null, video: null };
  let uploaded = 0;
  let failed = 0;

  try {
    // Process Aadhaar (can be multiple images or single PDF)
    if (kycFiles.aadhaar) {
      for (const file of kycFiles.aadhaar.slice(0, 2)) {
        try {
          const extension = path.extname(file.name).toLowerCase();
          const uniqueName = `aadhaar-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}${extension}`;
          const filePath = path.join(
            process.cwd(),
            "uploads",
            "kyc",
            "documents",
            uniqueName
          );

          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          fs.writeFileSync(filePath, buffer);

          files.aadhaar.push({
            url: `/uploads/kyc/documents/${uniqueName}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          });

          uploaded++;
        } catch (error) {
          console.error(`Failed to process Aadhaar file ${file.name}:`, error);
          failed++;
        }
      }
    }

    // Process PAN
    if (kycFiles.pan && kycFiles.pan[0]) {
      const file = kycFiles.pan[0];
      try {
        const extension = path.extname(file.name).toLowerCase();
        const uniqueName = `pan-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}${extension}`;
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "kyc",
          "documents",
          uniqueName
        );

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        files.pan = {
          url: `/uploads/kyc/documents/${uniqueName}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };

        uploaded++;
      } catch (error) {
        console.error(`Failed to process PAN file ${file.name}:`, error);
        failed++;
      }
    }

    // Process Agreement (PDF only)
    if (kycFiles.agreement && kycFiles.agreement[0]) {
      const file = kycFiles.agreement[0];
      try {
        const uniqueName = `agreement-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.pdf`;
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "kyc",
          "documents",
          uniqueName
        );

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        files.agreement = {
          url: `/uploads/kyc/documents/${uniqueName}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };

        uploaded++;
      } catch (error) {
        console.error(`Failed to process agreement file ${file.name}:`, error);
        failed++;
      }
    }

    // Process KYC Video
    if (kycFiles.video && kycFiles.video[0]) {
      const file = kycFiles.video[0];
      try {
        const extension = path.extname(file.name).toLowerCase();
        const uniqueName = `kyc-video-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}${extension}`;
        const filePath = path.join(
          process.cwd(),
          "uploads",
          "kyc",
          "videos",
          uniqueName
        );

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        files.video = {
          url: `/uploads/kyc/videos/${uniqueName}`,
          name: file.name,
          size: file.size,
          type: file.type,
          duration: 15, // Default 15 seconds as per UI
          uploadedAt: new Date(),
        };

        uploaded++;
      } catch (error) {
        console.error(`Failed to process KYC video ${file.name}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error("KYC file processing error:", error);
    failed++;
  }

  return { files, stats: { uploaded, failed } };
}
