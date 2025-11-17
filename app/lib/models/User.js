import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ["user", "partner", "admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false }, // KYC status
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
