import multer from "multer";
import path from "path";
import fs from "fs";

// Configure storage for different file types
const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(process.cwd(), "uploads", destination);
      // Ensure directory exists
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, uniqueSuffix + extension);
    },
  });
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

// Multer upload configurations for different file types
export const uploadKycVideo = multer({
  storage: createStorage("kyc/videos"),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
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

export const uploadKycDocuments = multer({
  storage: createStorage("kyc/documents"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    if (validateFileType.document(file.originalname)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only document files are allowed (pdf, doc, docx, txt, rtf)")
      );
    }
  },
});

export const uploadPropertyImages = multer({
  storage: createStorage("properties/images"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
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

export const uploadPropertyVideos = multer({
  storage: createStorage("properties/videos"),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for property videos
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
  storage: createStorage("amenities/images"),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for amenity images
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
    const basePath = path.join(process.cwd(), "uploads");
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
    const tempDir = path.join(process.cwd(), "uploads", "temp");
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
