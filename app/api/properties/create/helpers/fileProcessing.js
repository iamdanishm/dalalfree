import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// File validation constants
const FILE_VALIDATION = {
  images: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ],
    maxFiles: 20,
  },
  videos: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ],
    maxFiles: 5,
  },
  kycDocuments: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "image/heic",
      "image/heif",
    ],
    maxFiles: 10,
  },
  kycVideos: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
    maxFiles: 1,
  },
};

/**
 * Validate file against type-specific rules
 * @param {File} file - The file to validate
 * @param {string} fileType - Type of file ('images', 'videos', 'kycDocuments', 'kycVideos')
 * @returns {Object} Validation result
 */
export function validateFile(file, fileType) {
  const validationRules = FILE_VALIDATION[fileType];

  if (!validationRules) {
    return {
      valid: false,
      error: `Invalid file type category: ${fileType}`,
      code: "INVALID_FILE_CATEGORY",
    };
  }

  // Check file size
  if (file.size > validationRules.maxSize) {
    return {
      valid: false,
      error: `File too large. Max ${validationRules.maxSize / (1024 * 1024)}MB`,
      code: "FILE_TOO_LARGE",
    };
  }

  // Check file type
  if (!validationRules.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${validationRules.allowedTypes.join(
        ", "
      )}`,
      code: "INVALID_FILE_TYPE",
    };
  }

  return { valid: true };
}

/**
 * Generate secure filename
 * @param {File} file - The original file
 * @param {string} prefix - File prefix
 * @returns {string} Secure filename
 */
export function generateSecureFilename(file, prefix) {
  const extension = path.extname(file.name).toLowerCase();
  const uniqueId = uuidv4().replace(/-/g, "");
  return `${prefix}-${Date.now()}-${uniqueId}${extension}`;
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Process image files
 * @param {File[]} imageFiles - Array of image files
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Processing results
 */
export async function processImages(imageFiles, propertyId) {
  const files = [];
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  for (
    let i = 0;
    i < Math.min(imageFiles.length, FILE_VALIDATION.images.maxFiles);
    i++
  ) {
    const file = imageFiles[i];

    // Validate file
    const validation = validateFile(file, "images");
    if (!validation.valid) {
      failed++;
      errors.push({
        file: file.name,
        error: validation.error,
        code: validation.code,
      });
      continue;
    }

    try {
      const secureFilename = generateSecureFilename(file, "img");
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "properties",
        propertyId,
        "images",
        secureFilename
      );

      // Ensure directory exists
      ensureDirectoryExists(path.dirname(filePath));

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      files.push({
        id: `img-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/properties/${propertyId}/images/${secureFilename}`,
        category: "image",
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

/**
 * Process video files
 * @param {File[]} videoFiles - Array of video files
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Processing results
 */
export async function processVideos(videoFiles, propertyId) {
  const files = [];
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  for (
    let i = 0;
    i < Math.min(videoFiles.length, FILE_VALIDATION.videos.maxFiles);
    i++
  ) {
    const file = videoFiles[i];

    // Validate file
    const validation = validateFile(file, "videos");
    if (!validation.valid) {
      failed++;
      errors.push({
        file: file.name,
        error: validation.error,
        code: validation.code,
      });
      continue;
    }

    try {
      const secureFilename = generateSecureFilename(file, "vid");
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "properties",
        propertyId,
        "videos",
        secureFilename
      );

      // Ensure directory exists
      ensureDirectoryExists(path.dirname(filePath));

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      files.push({
        id: `vid-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/uploads/properties/${propertyId}/videos/${secureFilename}`,
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

/**
 * Process KYC files
 * @param {File[]} kycFilesArray - Array of KYC files
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Processing results
 */
export async function processKycFiles(kycFilesArray, propertyId) {
  const files = { documents: [], videos: [] };
  const errors = [];
  let uploaded = 0;
  let failed = 0;

  for (
    let i = 0;
    i < Math.min(kycFilesArray.length, FILE_VALIDATION.kycDocuments.maxFiles);
    i++
  ) {
    const file = kycFilesArray[i];
    const isVideo = file.type.startsWith("video/");

    // Validate file based on type
    const fileType = isVideo ? "kycVideos" : "kycDocuments";
    const validation = validateFile(file, fileType);

    if (!validation.valid) {
      failed++;
      errors.push({
        file: file.name,
        error: validation.error,
        code: validation.code,
      });
      continue;
    }

    try {
      const prefix = isVideo ? "kyc-vid" : "kyc-doc";
      let extension = path.extname(file.name).toLowerCase();

      // Handle video MIME types for browser recordings
      if (isVideo && (!extension || file.name === "blob")) {
        const mimeToExt = {
          "video/webm": ".webm",
          "video/mp4": ".mp4",
          "video/quicktime": ".mov",
        };
        extension = mimeToExt[file.type] || ".webm";
      }

      const secureFilename = generateSecureFilename(
        { name: `file${extension}` },
        prefix
      );
      const folder = isVideo ? "videos" : "documents";
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "properties",
        propertyId,
        "kyc",
        folder,
        secureFilename
      );

      // Ensure directory exists
      ensureDirectoryExists(path.dirname(filePath));

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const fileData = {
        url: `/uploads/properties/${propertyId}/kyc/${folder}/${secureFilename}`,
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

  return { files, stats: { uploaded, failed }, errors };
}

/**
 * Process all file uploads
 * @param {Object} fileFields - File fields from form data
 * @param {Object} propertyData - Property data
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Complete processing results
 */
export async function processFileUploads(fileFields, propertyData, propertyId) {
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

    // Process KYC files
    if (fileFields.kycFiles && fileFields.kycFiles.length > 0) {
      const kycResults = await processKycFiles(fileFields.kycFiles, propertyId);
      results.files.kycFiles = kycResults.files;
      results.stats.kyc = kycResults.stats;

      if (kycResults.stats.failed > 0) {
        results.hasPartialFailures = true;
        results.stats.kyc.errors = kycResults.errors || [];
      }
    }

    // Check for critical failures
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
