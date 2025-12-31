import multer from "multer";
import path from "path";
import fs from "fs";
import { UPLOAD_CONFIG } from "./upload-config.js";
import { UploadBridge as UploadBridgeClass } from "./upload-bridge.js";

// Generate unique filename with timestamp
const generateUniqueFilename = (req, file, cb) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const extension = path.extname(file.originalname);
  cb(null, uniqueSuffix + extension);
};

// File type validation functions
const allowedVideoTypes = /mp4|avi|mov|wmv|mkv|flv|webm/i;
const allowedImageTypes = /jpeg|jpg|png|gif|bmp|webp|tiff|tif/i;
const allowedDocumentTypes = /pdf|doc|docx|txt|rtf/i;

const validateFileType = {
  video: (filename) =>
    allowedVideoTypes.test(path.extname(filename).toLowerCase()),
  image: (filename) =>
    allowedImageTypes.test(path.extname(filename).toLowerCase()),
  document: (filename) =>
    allowedDocumentTypes.test(path.extname(filename).toLowerCase()),
};

// KYC Uploads (per property)
export const uploadKycVideo = (propertyId) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UploadBridgeClass.getStoragePath(propertyId, "kyc", "videos"));
      },
      filename: generateUniqueFilename,
    }),
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.video,
    },
    fileFilter: (req, file, cb) => {
      if (validateFileType.video(file.originalname)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only video files are allowed (mp4, avi, mov, wmv, mkv, flv, webm)"
          )
        );
      }
    },
  });

export const uploadKycDocuments = (propertyId) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(
          null,
          UploadBridgeClass.getStoragePath(propertyId, "kyc", "documents")
        );
      },
      filename: generateUniqueFilename,
    }),
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.document,
    },
    fileFilter: (req, file, cb) => {
      if (validateFileType.document(file.originalname)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only document files are allowed (pdf, doc, docx, txt, rtf)"
          )
        );
      }
    },
  });

export const uploadPropertyImages = (propertyId) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(
          null,
          UploadBridgeClass.getStoragePath(propertyId, "propertyImages")
        );
      },
      filename: generateUniqueFilename,
    }),
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.image,
    },
    fileFilter: (req, file, cb) => {
      if (validateFileType.image(file.originalname)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only image files are allowed (jpeg, jpg, png, gif, bmp, webp, tiff, tif)"
          )
        );
      }
    },
  });

export const uploadPropertyVideos = (propertyId) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(
          null,
          UploadBridgeClass.getStoragePath(propertyId, "propertyVideos")
        );
      },
      filename: generateUniqueFilename,
    }),
    limits: {
      fileSize: UPLOAD_CONFIG.maxFileSize.video,
    },
    fileFilter: (req, file, cb) => {
      if (validateFileType.video(file.originalname)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only video files are allowed (mp4, avi, mov, wmv, mkv, flv, webm)"
          )
        );
      }
    },
  });

export const uploadAmenityImages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UploadBridgeClass.getStoragePath(null, "amenities"));
    },
    filename: generateUniqueFilename,
  }),
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize.image,
  },
  fileFilter: (req, file, cb) => {
    if (validateFileType.image(file.originalname)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files are allowed (jpeg, jpg, png, gif, bmp, webp, tiff, tif)"
        )
      );
    }
  },
});

// Utility functions for file management
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export const getFileStats = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.ctime,
        modified: stats.mtime,
        exists: true,
      };
    }
    return { exists: false };
  } catch (error) {
    console.error("Error getting file stats:", error);
    return { exists: false };
  }
};

// Storage monitoring function
export const getStorageStats = () => {
  try {
    const basePath = UPLOAD_CONFIG.baseDir;
    let totalSize = 0;
    let fileCount = 0;

    const calculateSize = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          calculateSize(fullPath);
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    };

    calculateSize(basePath);

    return {
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      fileCount,
    };
  } catch (error) {
    console.error("Error calculating storage stats:", error);
    return { error: "Could not calculate storage stats" };
  }
};

// Cleanup old temp files (older than 24 hours)
export const cleanupTempFiles = (maxAgeHours = 24) => {
  try {
    const tempDir = path.join(UPLOAD_CONFIG.baseDir, "temp");
    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
        }
      } catch (error) {
        console.error(`Error checking temp file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error("Error during temp file cleanup:", error);
  }
};
