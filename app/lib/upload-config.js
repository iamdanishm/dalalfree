import path from "path";

export const UPLOAD_CONFIG = {
  // External directory (one level up from project)
  baseDir: path.join(process.cwd(), "..", "dalalfree-uploads"),

  // Folder structure
  structure: {
    // Master data - separate from properties
    amenities: "amenities/images",

    // Per-property data
    kyc: "properties/{propertyId}/kyc/{type}",
    propertyImages: "properties/{propertyId}/images",
    propertyVideos: "properties/{propertyId}/videos",
  },

  // File size limits (in bytes)
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 10 * 1024 * 1024, // 10MB
    amenity: 5 * 1024 * 1024, // 5MB
    kycVideo: 50 * 1024 * 1024, // 50MB
    global: 150 * 1024 * 1024, // 150MB total per request
  },

  // Allowed MIME types
  allowedTypes: {
    image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp", "image/tiff"],
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
    document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
  }
};
