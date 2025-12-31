import path from "path";
import fs from "fs";
import crypto from "crypto";
import { UPLOAD_CONFIG } from "./upload-config.js";
import Property from "./models/Property.js";

export class UploadBridge {
  static getStoragePath(propertyId, type, subType = "") {
    let template = UPLOAD_CONFIG.structure[type];

    // Only replace propertyId for property-specific types
    if (type !== "amenities" && propertyId) {
      template = template.replace("{propertyId}", propertyId);
      if (subType) {
        template = template.replace("{type}", subType);
      }
    }

    const fullPath = path.join(UPLOAD_CONFIG.baseDir, template);
    this.ensureDirectoryExists(fullPath);
    return fullPath;
  }

  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static getFileUrl(propertyId, type, filename, subType = "") {
    let template = UPLOAD_CONFIG.structure[type];

    if (type !== "amenities" && propertyId) {
      template = template.replace("{propertyId}", propertyId);
      if (subType) {
        template = template.replace("{type}", subType);
      }
    }

    const relativePath = path.join(template, filename).replace(/\\/g, "/");
    return `/api/files/${relativePath}`;
  }

  static getFilePath(propertyId, type, filename, subType = "") {
    let template = UPLOAD_CONFIG.structure[type];

    if (type !== "amenities" && propertyId) {
      template = template.replace("{propertyId}", propertyId);
      if (subType) {
        template = template.replace("{type}", subType);
      }
    }

    return path.join(template, filename).replace(/\\/g, "/");
  }

  /**
   * Generate a secure hash for property ID obfuscation
   * @param {string} propertyId - The MongoDB ObjectId
   * @returns {string} 16-character secure hash
   */
  static generatePropertyHash(propertyId) {
    const salt = process.env.FILE_HASH_SALT || "dalalfree-secure-salt-2025";
    return crypto
      .createHash("sha256")
      .update(propertyId + salt)
      .digest("hex")
      .substring(0, 16); // 16 character hash
  }

  /**
   * Get property ID from secure hash (reverse lookup)
   * @param {string} hash - The secure hash
   * @returns {Promise<string|null>} Property ID or null if not found
   */
  static async getPropertyIdFromHash(hash) {
    try {
      // Find property by hash (we'll add hash field to Property model)
      const property = await Property.findOne({ fileHash: hash }).select("_id");
      return property ? property._id.toString() : null;
    } catch (error) {
      console.error("Error resolving property hash:", error);
      return null;
    }
  }

  /**
   * Get secure file URL using hashed property ID
   * @param {string} propertyId - Property ID
   * @param {string} type - File type
   * @param {string} filename - File name
   * @param {string} subType - Sub-type for KYC
   * @returns {string} Secure file URL
   */
  static getSecureFileUrl(propertyId, type, filename, subType = "") {
    const hash = this.generatePropertyHash(propertyId);
    let template = UPLOAD_CONFIG.structure[type];

    if (type !== "amenities" && propertyId) {
      template = template.replace("{propertyId}", hash); // Use hash instead of ID
      if (subType) {
        template = template.replace("{type}", subType);
      }
    }

    const relativePath = path.join(template, filename).replace(/\\/g, "/");
    return `/api/files/${relativePath}`;
  }

  /**
   * Get secure storage path using hashed property ID
   * @param {string} propertyId - Property ID
   * @param {string} type - File type
   * @param {string} subType - Sub-type for KYC
   * @returns {string} Secure storage path
   */
  static getSecureStoragePath(propertyId, type, subType = "") {
    const hash = this.generatePropertyHash(propertyId);
    let template = UPLOAD_CONFIG.structure[type];

    if (type !== "amenities" && propertyId) {
      template = template.replace("{propertyId}", hash); // Use hash instead of ID
      if (subType) {
        template = template.replace("{type}", subType);
      }
    }

    const fullPath = path.join(UPLOAD_CONFIG.baseDir, template);
    this.ensureDirectoryExists(fullPath);
    return fullPath;
  }
}
