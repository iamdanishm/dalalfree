import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    password: { type: String, required: true, minlength: 8 },
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    role: {
      type: String,
      enum: ["user", "partner", "sub-admin", "admin"],
      default: "user",
    },
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

    // Subscription object only for regular users (buyers/sellers)
    subscription: {
      type: {
        status: {
          type: String,
          enum: ["free_trial", "active", "expired", "cancelled", "none"],
          default: "none",
        },
        startDate: { type: Date },
        endDate: { type: Date },
        freeTrialUsed: { type: Boolean, default: false },
        freeTrialStartDate: { type: Date },
        freeTrialEndDate: { type: Date },
        adUnlockCredits: {
          type: Number,
          default: 0,
          min: 0,
        }
      },
      required: false, // Only required for users, not admins/partners
    },

    // Password reset OTP fields
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

// Pre-save middleware to conditionally set subscription for regular users only
UserSchema.pre('save', function(next) {
  // Only regular users (role: "user") should have subscription data
  if (this.role === 'user') {
    // Ensure subscription object exists for regular users
    if (!this.subscription) {
      this.subscription = {
        status: 'none',
        freeTrialUsed: false,
        adUnlockCredits: 0
      };
    }
  } else {
    // Remove subscription data for non-user roles
    this.subscription = undefined;
  }
  next();
});

// Add indexes for performance - single field indexes
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });

// Compound index for admin user queries: role + accountStatus + createdAt
// Used in /api/admin/users for filtering and sorting admin user lists
UserSchema.index({ role: 1, accountStatus: 1, createdAt: -1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
