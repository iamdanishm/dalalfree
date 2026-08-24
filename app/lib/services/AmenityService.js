import Amenity from "../models/Amenity";
import { AppError } from "../utils/errors";
import { connectDB } from "../db";
import { UploadBridge } from "../upload-bridge";
import { UPLOAD_CONFIG } from "../upload-config";
import path from "path";
import fs from "fs";

export class AmenityService {
  /**
   * List amenities with pagination
   */
  static async listAmenities(params) {
    await connectDB();
    const { page = 1, limit = 10, search } = params;
    
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const [amenities, total] = await Promise.all([
      Amenity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Amenity.countDocuments(query)
    ]);

    return {
      amenities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Create new amenity with image
   */
  static async createAmenity(data, imageFile) {
    await connectDB();
    const { title, available = true } = data;

    if (!title) throw new AppError("Title is required", 400);
    if (!imageFile) throw new AppError("Image is required", 400);

    // File validation
    const allowedImageTypes = UPLOAD_CONFIG.allowedTypes.image;
    if (!allowedImageTypes.includes(imageFile.type.toLowerCase())) {
      throw new AppError("Only image files are allowed", 400);
    }

    const maxSize = UPLOAD_CONFIG.maxFileSize.amenity;
    if (imageFile.size > maxSize) {
      throw new AppError(`Image size cannot exceed ${maxSize / (1024 * 1024)}MB`, 400);
    }

    // Save image
    const timestamp = Date.now();
    const filename = `${timestamp}-${Math.round(Math.random() * 1e9)}.${imageFile.name.split(".").pop()}`;
    const dirPath = await UploadBridge.getStoragePath(null, "amenities");
    const fullPath = path.join(dirPath, filename);
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.promises.writeFile(fullPath, buffer);

    const imageUrl = UploadBridge.getFileUrl(null, "amenities", filename);

    return await Amenity.create({
      title: title.trim(),
      image: imageUrl,
      available,
    });
  }

  /**
   * Update existing amenity
   */
  static async updateAmenity(id, updateData) {
    await connectDB();
    const amenity = await Amenity.findByIdAndUpdate(id, updateData, { new: true });
    if (!amenity) throw new AppError("Amenity not found", 404);
    return amenity;
  }

  /**
   * Delete amenity
   */
  static async deleteAmenity(id) {
    await connectDB();
    const amenity = await Amenity.findByIdAndDelete(id);
    if (!amenity) throw new AppError("Amenity not found", 404);
    
    // Optionally cleanup image file here
    return true;
  }
}
