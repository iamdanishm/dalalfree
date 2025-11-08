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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.models.Kyc || mongoose.model("Kyc", kycSchema);
