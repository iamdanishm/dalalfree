import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    price: Number,
    location: String,
    verified: { type: Boolean, default: false }, // Keep for backward compatibility
    featured: { type: Boolean, default: false }, // Paid featured listings
    boosted: { type: Boolean, default: false }, // Temporary promotion
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
    rejectionReason: String,
    images: [String],
    companionPhotos: [String], // Additional property images
    propertyType: {
      type: String,
      enum: ["sell", "rent", "lease"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial", "Land"],
      required: true,
    },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "featured"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Add indexes for performance - single field indexes
propertySchema.index({ status: 1 });
propertySchema.index({ verified: 1 });
propertySchema.index({ featured: 1 });
propertySchema.index({ boosted: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ viewsCount: 1 });
propertySchema.index({ likesCount: 1 });

// Compound index for admin property queries: status + propertyType + createdAt
// Used in /api/admin/properties for filtering and sorting property management lists
propertySchema.index({ status: 1, propertyType: 1, createdAt: -1 });

export default mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
