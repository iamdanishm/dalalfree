// Property creation helpers for transforming UI data to API format

/**
 * Transforms UI form data into API-compatible format for property creation
 * @param {Object} formData - Raw form data from the wizard
 * @returns {FormData} - FormData object ready for API submission
 */
export function transformPropertyDataForAPI(formData) {
  const apiData = new FormData();

  // Basic property information
  apiData.append("title", formData.title || "");
  apiData.append("description", formData.description || "");
  apiData.append("propertyType", formData.propertyType || "sell");
  apiData.append("category", formData.category || "Residential");
  apiData.append("price", String(formData.price || 0));
  apiData.append("marketRange", formData.marketRange || "");
  apiData.append("negotiable", formData.negotiable || "No");

  // Location data
  apiData.append("address", formData.address || "");
  apiData.append("location", formData.location || "");
  apiData.append("city", formData.city || "");
  apiData.append("state", formData.state || "");
  apiData.append("pincode", formData.pincode || "");
  if (formData.coordinates) {
    apiData.append("coordinates", JSON.stringify(formData.coordinates));
  }

  // Specifications
  apiData.append("bhk", formData.bhk || "");
  apiData.append("bathrooms", String(formData.bathrooms || ""));
  apiData.append("balcony", String(formData.balcony || ""));
  apiData.append("furnishing", formData.furnishing || "");
  apiData.append("builtUpArea", String(formData.builtUpArea || ""));
  apiData.append("carpetArea", String(formData.carpetArea || ""));
  apiData.append("floor", formData.floor || "");
  apiData.append("totalFloors", String(formData.totalFloors || ""));
  apiData.append("age", String(formData.age || ""));
  apiData.append("ageUnit", formData.ageUnit || "years old");
  apiData.append("parking", formData.parking || "");
  apiData.append("facing", formData.facing || "");
  apiData.append("possessionStatus", formData.possessionStatus || "");
  apiData.append("maintenance", formData.maintenance || "");

  // Arrays and objects
  if (formData.highlights && Array.isArray(formData.highlights)) {
    apiData.append("highlights", JSON.stringify(formData.highlights));
  }

  if (formData.societyAmenities && Array.isArray(formData.societyAmenities)) {
    apiData.append(
      "societyAmenities",
      JSON.stringify(formData.societyAmenities)
    );
  }

  if (formData.nearbyPlaces && Array.isArray(formData.nearbyPlaces)) {
    apiData.append("nearbyPlaces", JSON.stringify(formData.nearbyPlaces));
  }

  // File handling - these will be added separately
  // images: File[]
  // videos: File[]
  // kycFiles: { aadhaar: File[], pan: File, agreement: File, video: File }

  return apiData;
}

/**
 * Adds files to the FormData object
 * @param {FormData} formData - The FormData object to add files to
 * @param {Object} files - File objects from the UI
 */
export function addFilesToFormData(formData, files) {
  // Add images
  if (files.images && Array.isArray(files.images)) {
    files.images.forEach((file, index) => {
      if (file.file) {
        formData.append("images", file.file);
      }
    });
  }

  // Add videos
  if (files.videos && Array.isArray(files.videos)) {
    files.videos.forEach((file, index) => {
      if (file.file) {
        formData.append("videos", file.file);
      }
    });
  }

  // Add KYC files
  if (files.kycFiles) {
    // Aadhaar files
    if (files.kycFiles.aadhaar && Array.isArray(files.kycFiles.aadhaar)) {
      files.kycFiles.aadhaar.forEach((file) => {
        if (file.file) {
          formData.append("kycFiles", file.file);
        }
      });
    }

    // PAN file
    if (files.kycFiles.pan && files.kycFiles.pan.file) {
      formData.append("kycFiles", files.kycFiles.pan.file);
    }

    // Agreement file
    if (files.kycFiles.agreement && files.kycFiles.agreement.file) {
      formData.append("kycFiles", files.kycFiles.agreement.file);
    }

    // Video file
    if (files.kycFiles.video && files.kycFiles.video.file) {
      formData.append("kycFiles", files.kycFiles.video.file);
    }
  }

  return formData;
}

/**
 * Validates property data before submission
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors
 */
export function validatePropertyData(formData) {
  const errors = {};

  // Required fields
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
  ];

  requiredFields.forEach((field) => {
    if (
      !formData[field] ||
      (typeof formData[field] === "string" && formData[field].trim() === "")
    ) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
    }
  });

  // Numeric validations
  if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
    errors.price = "Price must be a valid positive number";
  }

  if (
    formData.builtUpArea &&
    (isNaN(formData.builtUpArea) || formData.builtUpArea <= 0)
  ) {
    errors.builtUpArea = "Built-up area must be a positive number";
  }

  if (
    formData.carpetArea &&
    (isNaN(formData.carpetArea) || formData.carpetArea <= 0)
  ) {
    errors.carpetArea = "Carpet area must be a positive number";
  }

  if (formData.age && (isNaN(formData.age) || formData.age < 0)) {
    errors.age = "Age must be a valid non-negative number";
  }

  // Coordinates validation
  if (
    !formData.coordinates ||
    !formData.coordinates.lat ||
    !formData.coordinates.lng
  ) {
    errors.coordinates = "Location coordinates are required";
  }

  // BHK validation for residential
  if (formData.category === "Residential" && !formData.bhk) {
    errors.bhk = "BHK configuration is required for residential properties";
  }

  // File validations
  if (!formData.images || formData.images.length === 0) {
    errors.images = "At least one property image is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Creates a summary of the property data for review
 * @param {Object} formData - Property form data
 * @returns {Object} - Summary object
 */
export function createPropertySummary(formData) {
  return {
    basic: {
      title: formData.title,
      type: `${formData.propertyType} - ${formData.category}`,
      price: formData.price,
      location: `${formData.location}, ${formData.city}`,
    },
    specifications: {
      bhk: formData.bhk,
      area: `${formData.builtUpArea} sq ft built-up, ${formData.carpetArea} sq ft carpet`,
      floor: `${formData.floor}${
        formData.totalFloors ? ` of ${formData.totalFloors}` : ""
      }`,
      age: `${formData.age} ${formData.ageUnit}`,
      furnishing: formData.furnishing,
    },
    amenities: {
      society: formData.societyAmenities?.length || 0,
      nearby: formData.nearbyPlaces?.length || 0,
      highlights: formData.highlights?.length || 0,
    },
    media: {
      images: formData.images?.length || 0,
      videos: formData.videos?.length || 0,
    },
    kyc: {
      aadhaar: formData.kycFiles?.aadhaar?.length || 0,
      pan: formData.kycFiles?.pan ? 1 : 0,
      agreement: formData.kycFiles?.agreement ? 1 : 0,
      video: formData.kycFiles?.video ? 1 : 0,
    },
  };
}

/**
 * Estimates the time required for property processing
 * @param {Object} formData - Property form data
 * @returns {string} - Estimated processing time
 */
export function estimateProcessingTime(formData) {
  let baseTime = 5; // Base 5 minutes

  // Add time for media processing
  const imageCount = formData.images?.length || 0;
  const videoCount = formData.videos?.length || 0;

  baseTime += imageCount * 0.5; // 30 seconds per image
  baseTime += videoCount * 2; // 2 minutes per video

  // Add time for KYC processing
  const kycFiles = formData.kycFiles || {};
  const kycCount =
    (kycFiles.aadhaar?.length || 0) +
    (kycFiles.pan ? 1 : 0) +
    (kycFiles.agreement ? 1 : 0) +
    (kycFiles.video ? 1 : 0);
  baseTime += kycCount * 1; // 1 minute per KYC file

  // Add admin review time
  baseTime += 10; // 10 minutes for admin review

  if (baseTime < 15) return "15 minutes";
  if (baseTime < 30) return "30 minutes";
  if (baseTime < 60) return "1 hour";
  return `${Math.ceil(baseTime / 60)} hours`;
}
