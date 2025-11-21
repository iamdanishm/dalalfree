import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ["buyer", "seller", "partner", "sub-admin", "admin"],
      default: "buyer",
    },
    isSubAdmin: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
    accountStatusReason: { type: String },
    reraNumber: {
      type: String,
      validate: {
        validator: function (value) {
          // RERA required only for partners
          if (this.role === "partner") {
            return value && value.trim() !== "";
          }
          return true; // optional for others
        },
        message: "RERA number is required for partners",
      },
    },
    isVerified: { type: Boolean, default: false }, // KYC status

    // Subscription fields for buyers
    subscriptionStatus: {
      type: String,
      enum: ["free_trial", "active", "expired", "cancelled", "none"],
      default: function () {
        // New buyers get free trial
        return this.role === "buyer" ? "free_trial" : "none";
      },
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    freeTrialUsed: { type: Boolean, default: false },
    freeTrialStartDate: { type: Date },
    freeTrialEndDate: {
      type: Date,
      default: function () {
        // Set 1-month free trial for new buyers
        return this.role === "buyer"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;
      },
    },
    adUnlockCredits: {
      type: Number,
      default: function () {
        // Buyers get some free ad unlock credits
        return this.role === "buyer" ? 5 : 0;
      },
      min: 0,
    },
  },
  { timestamps: true }
);

// Add indexes for performance - single field indexes
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isSubAdmin: 1 });

// Compound index for admin user queries: role + accountStatus + createdAt
// Used in /api/admin/users for filtering and sorting admin user lists
UserSchema.index({ role: 1, accountStatus: 1, createdAt: -1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
