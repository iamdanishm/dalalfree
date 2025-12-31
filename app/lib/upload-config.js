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

  // File size limits
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 10 * 1024 * 1024, // 10MB
  },
};
