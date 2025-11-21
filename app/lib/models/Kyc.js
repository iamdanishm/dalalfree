import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aadhaarPhoto: { type: String, required: true },
    agreementPhoto: { type: String, required: true },
    videoUrl: { type: String, required: true },
    documentUrls: [String], // Additional supporting documents
    videoReviewTime: { type: Number, default: 0 }, // Video playback position
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalLevel: {
      type: String,
      enum: ["basic", "premium", "partner"],
      default: "basic",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: Date,
    remarks: String, // Keep for admin review notes
    rejectionReason: String, // Specific rejection reason
  },
  { timestamps: true }
);

// Add indexes for performance - single field indexes
kycSchema.index({ status: 1 });
kycSchema.index({ userId: 1 });
kycSchema.index({ approvalLevel: 1 });
kycSchema.index({ reviewedBy: 1 });

// Compound index for admin KYC queries: status + approvalLevel + createdAt
// Used in /api/admin/kyc for filtering and sorting KYC workflow lists
kycSchema.index({ status: 1, approvalLevel: 1, createdAt: -1 });

export default mongoose.models.Kyc || mongoose.model("Kyc", kycSchema);
