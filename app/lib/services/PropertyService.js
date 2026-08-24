import Property from "../models/Property";
import { generateUniquePropertySlug } from "../slug";
import { UploadBridge } from "../upload-bridge";
import { transformSocietyAmenities, transformNearbyPlacesToAmenities } from "../../api/properties/create/helpers/amenities";
import { processFileUploads } from "../../api/properties/create/helpers/fileProcessing";
import {
  categorizeKycDocuments,
  transformKycFilesToDatabaseStructure,
} from "../../api/properties/create/helpers/kycProcessing";
import { AppError } from "../utils/errors";

export class PropertyService {
  /**
   * Creates a new property with its associated files and transformations.
   * @param {Object} textData - The text fields from the form
   * @param {Object} fileFields - The files from the form
   * @param {string} userId - ID of the property owner
   */
  static async createProperty(textData, fileFields, userId) {
    // 1. Generate slug
    const slug = textData.slug || (await generateUniquePropertySlug(textData.title));

    // 2. Transform basic data
    const propertyData = this._transformPropertyData(textData, userId, slug);

    // 3. Transform amenities
    propertyData.societyAmenities = Array.isArray(textData.societyAmenities)
      ? textData.societyAmenities
      : [];

    // 4. Create property record
    const property = await Property.create(propertyData);
    const propertyId = property._id.toString();

    try {
      // 5. Generate secure hash for files
      const fileHash = UploadBridge.generatePropertyHash(propertyId);
      
      // 6. Process file uploads
      const fileProcessingResults = await processFileUploads(
        fileFields,
        propertyData,
        propertyId
      );

      // 7. Categorize and structure KYC files
      const kycFilesData = fileProcessingResults.files?.kycFiles || {};
      const categorizedDocs = categorizeKycDocuments(kycFilesData.documents || []);
      const kycFilesForDB = transformKycFilesToDatabaseStructure(categorizedDocs, kycFilesData.videos || []);

      // 8. Final update with all file-related data
      const finalProperty = await Property.findByIdAndUpdate(
        propertyId,
        {
          fileHash,
          images: fileProcessingResults.files.images || [],
          videos: fileProcessingResults.files.videos || [],
          kycFiles: kycFilesForDB,
        },
        { new: true }
      );

      return {
        id: finalProperty._id,
        slug: finalProperty.slug,
        title: finalProperty.title,
        status: finalProperty.status,
        fileStats: fileProcessingResults.stats
      };
    } catch (error) {
      // If file processing fails, we might want to cleanup the property or mark it as "failed"
      // For now, we just rethrow to the route handler
      console.error(`[PropertyService] Error during file processing for ${propertyId}:`, error);
      throw error;
    }
  }

  /**
   * Internal helper to transform raw text data into DB structure
   */
  static _transformPropertyData(textData, userId, slug) {
    return {
      ownerId: userId,
      title: textData.title,
      slug,
      description: textData.description,
      subtitle: textData.subtitle,
      price: parseFloat(textData.price) || 0,
      propertyType: textData.propertyType,
      category: textData.category,
      bhk: textData.bhk,
      bathrooms: parseInt(textData.bathrooms) || undefined,
      balcony: parseInt(textData.balcony) || undefined,
      furnishing: textData.furnishing,
      builtUpArea: parseFloat(textData.builtUpArea),
      carpetArea: parseFloat(textData.carpetArea),
      floor: textData.floor,
      totalFloors: parseInt(textData.totalFloors) || undefined,
      age: parseInt(textData.age) || 0,
      parking: textData.parking,
      facing: textData.facing,
      possessionStatus: textData.possessionStatus,
      location: textData.location,
      address: textData.address,
      city: textData.city,
      state: textData.state,
      pincode: textData.pincode,
      coordinates: textData.coordinates,
      highlights: textData.highlights || [],
      nearbyPlaces: Array.isArray(textData.nearbyPlaces) ? textData.nearbyPlaces : [],
      status: "pending",
      verified: false,
      // Rent specific
      deposit: textData.propertyType === "rent" ? parseFloat(textData.deposit) : undefined,
      preferredTenants: textData.propertyType === "rent" ? textData.preferredTenants : undefined,
      availableFrom: textData.propertyType === "rent" ? textData.availableFrom : undefined,
      maintenance: textData.maintenance,
    };
  }

  /**
   * Update property status (Approve/Reject/Archive)
   */
  static async updateStatus(propertyId, adminId, updateData) {
    const { status, verified, rejectionReason, isArchived, archivedReason } = updateData;
    
    const property = await Property.findById(propertyId).populate("ownerId", "name email");
    if (!property) {
      throw new AppError("Property not found", 404);
    }

    let emailType = null;
    let emailData = {};

    if (status === "approved" && verified === true) {
      property.status = "approved";
      property.verified = true;
      property.approvedBy = adminId;
      property.approvalDate = new Date();
      property.rejectionReason = null;
      emailType = "propertyApproval";
      emailData = {
        ownerName: property.ownerId.name,
        propertyTitle: property.title,
        propertyType: property.propertyType,
        approvedDate: property.approvalDate,
      };
    } else if (status === "rejected" && rejectionReason) {
      property.status = "rejected";
      property.rejectionReason = rejectionReason;
      emailType = "propertyRejection";
      emailData = {
        ownerName: property.ownerId.name,
        propertyTitle: property.title,
        propertyType: property.propertyType,
        reason: rejectionReason,
      };
    }

    if (isArchived !== undefined) {
      property.isArchived = isArchived;
      if (isArchived) {
        property.archivedAt = new Date();
        property.archivedReason = archivedReason || "Archived by admin";
      } else {
        property.archivedAt = null;
        property.archivedReason = null;
      }
    }

    await property.save();

    // Side effect: Send email
    if (emailType) {
      try {
        const { sendEmail } = await import("../email");
        await sendEmail(property.ownerId.email, emailType, emailData);
      } catch (err) {
        console.error(`[PropertyService] Failed to send email for ${propertyId}:`, err);
      }
    }

    return property;
  }

  /**
   * Search properties with filters and pagination
   */
  static async searchProperties(filters) {
    await connectDB();
    const { tab, city, locality, propertyType, budgetMin, budgetMax, sort: sortBy, verifiedOnly, limit = 50, page = 1 } = filters;

    let query = {};

    if (tab === "buy") {
      query.propertyType = "sell";
    } else if (tab === "rent") {
      query.propertyType = "rent";
    } else if (tab === "commercial") {
      query.category = "Commercial";
    }

    if (city) query.city = { $regex: city, $options: "i" };
    if (locality) query.locality = { $regex: locality, $options: "i" };
    if (propertyType) query.bhk = { $regex: propertyType, $options: "i" };

    if (budgetMin || budgetMax) {
      query.price = {};
      if (budgetMin) query.price.$gte = budgetMin;
      if (budgetMax) query.price.$lte = budgetMax;
    }

    if (verifiedOnly) query.verified = true;

    let sortOptions = {};
    switch (sortBy) {
      case "price-low": sortOptions.price = 1; break;
      case "price-high": sortOptions.price = -1; break;
      case "verified-first": 
        sortOptions.verified = -1;
        sortOptions.createdAt = -1;
        break;
      case "newest": sortOptions.createdAt = -1; break;
      case "oldest": sortOptions.createdAt = 1; break;
      default: sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;
    const [properties, totalCount] = await Promise.all([
        Property.find(query)
            .populate("ownerId", "name email role")
            .select("-partnerCommission -commissionPaid -commissionPaidDate -commissionTransactionId")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        Property.countDocuments(query)
    ]);

    return {
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }
}


