// Property creation helpers for transforming UI data to API format

// Utility function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  if (!num || isNaN(num)) return num;
  const j = num % 10;
  const k = num % 100;
  if (j == 1 && k != 11) return num + "st";
  if (j == 2 && k != 12) return num + "nd";
  if (j == 3 && k != 13) return num + "rd";
  return num + "th";
};

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
  apiData.append("balcony", formData.balcony !== undefined && formData.balcony !== null ? String(formData.balcony) : "");
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

  // Rent specific fields
  if (formData.propertyType === "rent") {
    apiData.append("deposit", String(formData.deposit || ""));
    apiData.append("preferredTenants", formData.preferredTenants || "");
    apiData.append("availableFrom", formData.availableFrom || "");
  }

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
 * Adds files to the FormData object with proper field structure for the API
 * @param {FormData} formData - The FormData object to add files to
 * @param {Object} files - File objects from the UI
 */
export function addFilesToFormData(formData, files) {
  // Add property images
  if (files.images && Array.isArray(files.images)) {
    files.images.forEach((fileObj, index) => {
      if (fileObj.file) {
        formData.append("images", fileObj.file);
      }
    });
  }

  // Add property videos
  if (files.videos && Array.isArray(files.videos)) {
    files.videos.forEach((fileObj, index) => {
      if (fileObj.file) {
        formData.append("videos", fileObj.file);
      }
    });
  }

  // Add KYC files with specific field names
  // We use the same field name 'kycFiles' but prefix filenames to help categorization
  if (files.kycFiles) {
    // Aadhaar files (can be multiple)
    if (files.kycFiles.aadhaar && Array.isArray(files.kycFiles.aadhaar)) {
      files.kycFiles.aadhaar.forEach((fileObj, index) => {
        if (fileObj.file) {
          const renamedFile = new File(
            [fileObj.file],
            `aadhaar_${index}_${fileObj.file.name}`,
            { type: fileObj.file.type }
          );
          formData.append("kycFiles", renamedFile);
        }
      });
    }

    // PAN file (single)
    if (files.kycFiles.pan && files.kycFiles.pan.file) {
      const panFile = files.kycFiles.pan.file;
      const renamedFile = new File(
        [panFile],
        `pancard_${panFile.name}`,
        { type: panFile.type }
      );
      formData.append("kycFiles", renamedFile);
    }

    // Agreement file (single)
    if (files.kycFiles.agreement && files.kycFiles.agreement.file) {
      const agreementFile = files.kycFiles.agreement.file;
      const renamedFile = new File(
        [agreementFile],
        `agreement_${agreementFile.name}`,
        { type: agreementFile.type }
      );
      formData.append("kycFiles", renamedFile);
    }

    // KYC verification video (single)
    if (files.kycFiles.video && files.kycFiles.video.file) {
      const videoFile = files.kycFiles.video.file;
      const renamedFile = new File(
        [videoFile],
        `video_${videoFile.name}`,
        { type: videoFile.type }
      );
      formData.append("kycFiles", renamedFile);
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
  ];

  // Possession status is only for sales
  if (formData.propertyType !== "rent") {
    requiredFields.push("possessionStatus");
  }

  // Additional required fields for rent
  if (formData.propertyType === "rent") {
    requiredFields.push("deposit", "preferredTenants", "availableFrom");
  }

  requiredFields.forEach((field) => {
    if (
      !formData[field] ||
      (typeof formData[field] === "string" && formData[field].trim() === "")
    ) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
    }
  });

  // Numeric validations
  if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
    errors.price = formData.propertyType === "rent" ? "Monthly rent must be a valid positive number" : "Price must be a valid positive number";
  }

  if (formData.propertyType === "rent" && formData.deposit && (isNaN(formData.deposit) || formData.deposit < 0)) {
    errors.deposit = "Security deposit must be a valid non-negative number";
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
      deposit: formData.propertyType === "rent" ? formData.deposit : undefined,
      location: `${formData.location}, ${formData.city}`,
    },
    specifications: {
      bhk: formData.bhk,
      preferredTenants: formData.propertyType === "rent" ? formData.preferredTenants : undefined,
      availableFrom: formData.propertyType === "rent" ? formData.availableFrom : undefined,
      area: `${formData.builtUpArea} sq ft built-up, ${formData.carpetArea} sq ft carpet`,
      floor: formData.floor
        ? `${getOrdinalSuffix(formData.floor)}${formData.totalFloors ? ` of ${formData.totalFloors}` : ""
        }`
        : "N/A",
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
 * Creates complete FormData for direct API submission
 * @param {Object} formData - Raw form data from the wizard
 * @param {Object} files - File objects from the UI
 * @returns {FormData} - Complete FormData object ready for API submission
 */
export function createPropertyFormData(formData, files = {}) {
  // Start with basic property data
  const apiData = transformPropertyDataForAPI(formData);

  // Add files to the FormData
  return addFilesToFormData(apiData, files);
}

/**
 * Retry mechanism for failed file uploads
 * @param {Array} failedFiles - Array of failed file objects with retry info
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} - Results of retry attempts
 */
export async function retryFailedUploads(failedFiles, maxRetries = 2) {
  const results = {
    successful: [],
    stillFailed: [],
    totalRetries: 0,
  };

  for (const failedFile of failedFiles) {
    if (failedFile.retries >= maxRetries) {
      results.stillFailed.push(failedFile);
      continue;
    }

    try {
      // Implement retry logic based on file type
      // This would call the appropriate API endpoint with the failed file
      const retryResult = await retrySingleFile(failedFile);
      if (retryResult.success) {
        results.successful.push(retryResult);
      } else {
        failedFile.retries = (failedFile.retries || 0) + 1;
        results.stillFailed.push(failedFile);
      }
      results.totalRetries++;
    } catch (error) {
      failedFile.retries = (failedFile.retries || 0) + 1;
      results.stillFailed.push(failedFile);
      results.totalRetries++;
    }
  }

  return results;
}

/**
 * Retry a single failed file upload
 * @param {Object} failedFile - Failed file object
 * @returns {Promise<Object>} - Retry result
 */
async function retrySingleFile(failedFile) {
  // This would implement the actual retry logic
  // For now, return a mock success/failure
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random success/failure for demo
      const success = Math.random() > 0.5;
      resolve({
        success,
        file: failedFile,
        ...(success && { newUrl: `/api/files/retry/${failedFile.name}` }),
      });
    }, 1000);
  });
}

/**
 * Validates file in real-time as user selects
 * @param {File} file - File to validate
 * @param {string} type - File type category ('image', 'video', 'document')
 * @returns {Object} - Validation result with errors and warnings
 */
export function validateFileRealTime(file, type) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Basic file checks
  if (!file) {
    result.isValid = false;
    result.errors.push("No file selected");
    return result;
  }

  // File size validation
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 10 * 1024 * 1024, // 10MB
  };

  const maxSize = maxSizes[type] || maxSizes.document;
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(
      `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
    );
  }

  // File type validation
  const allowedTypes = {
    image: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/tiff",
      "image/tif",
    ],
    video: [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/mkv",
      "video/flv",
      "video/webm",
    ],
    document: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  };

  const validTypes = allowedTypes[type] || allowedTypes.document;
  if (!validTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push(`Invalid file type. Allowed: ${validTypes.join(", ")}`);
  }

  // Warnings for large files
  if (file.size > maxSize * 0.8) {
    result.warnings.push("Large file detected - upload may take longer");
  }

  // Warnings for certain file types
  if (file.type === "image/tiff" || file.type === "image/tif") {
    result.warnings.push(
      "TIFF files may not display correctly in all browsers"
    );
  }

  return result;
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

/**
 * Formats a price number into a human-readable string (Lakh/Crore) following Indian numbering system
 * @param {number|string} price - The price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  const numPrice = Number(price);
  if (!numPrice || isNaN(numPrice)) return "Price on request";

  if (numPrice >= 10000000) {
    // 1 Crore or more
    const crores = numPrice / 10000000;
    return `₹${crores.toLocaleString("en-IN", {
      minimumFractionDigits: crores % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    })} Crore`;
  }

  if (numPrice >= 100000) {
    // 1 Lakh or more
    const lakhs = numPrice / 100000;
    return `₹${lakhs.toLocaleString("en-IN", {
      minimumFractionDigits: lakhs % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 2,
    })} Lakh`;
  }

  // Less than 1 lakh - show as-is with commas
  return `₹${numPrice.toLocaleString("en-IN")}`;
};
