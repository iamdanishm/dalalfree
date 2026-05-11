import mongoose from "mongoose";
import { REGEX } from "../validation";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return REGEX.EMAIL.test(v);
        },
        message: 'Invalid email format'
      }
    },
    password: { type: String, required: true, minlength: 8 },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || REGEX.PHONE.test(v);
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

    // Partner specific fields - only for role: "partner"
    partnerCommissionRate: {
      type: Number,
      default: 0.9, // 90% commission rate
      min: 0,
      max: 1
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingWithdrawals: {
      type: Number,
      default: 0,
      min: 0
    },
    withdrawnAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastWithdrawalDate: {
      type: Date
    },

    // Password reset OTP fields
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiry: { type: Date },
    resetPasswordOtpAttempts: { type: Number, default: 0 },
    lastOtpAttempt: { type: Date },

    // Partner Request
    partnerRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none"
    },
    partnerRequestDate: { type: Date },
  },
  { timestamps: true }
);

// Pre-save middleware to conditionally set data based on roles
UserSchema.pre('save', function (next) {
  console.log(`[UserModel] Pre-save for user ${this.email}, role: ${this.role}, status: ${this.partnerRequestStatus}`);

  // Ensure accountStatus is lowercase
  if (this.accountStatus) {
    this.accountStatus = this.accountStatus.toLowerCase();
  }

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

  // Only partners (role: "partner") should have earnings data. 
  // RERA number is also preserved if there is a pending partner request.
  if (this.role === 'partner') {
    // Initialize partner fields if they are missing
    if (this.partnerCommissionRate === undefined) this.partnerCommissionRate = 0.9;
    if (this.totalEarnings === undefined) this.totalEarnings = 0;
    if (this.pendingWithdrawals === undefined) this.pendingWithdrawals = 0;
    if (this.withdrawnAmount === undefined) this.withdrawnAmount = 0;
  } else {
    // Remove partner data for non-partner roles
    this.partnerCommissionRate = undefined;
    this.totalEarnings = undefined;
    this.pendingWithdrawals = undefined;
    this.withdrawnAmount = undefined;
    this.lastWithdrawalDate = undefined;
    this.reraNumber = undefined;

    // Also clear request status if they are no longer a partner
    if (this.role !== 'partner' && this.partnerRequestStatus === 'approved') {
      this.partnerRequestStatus = 'none';
      this.partnerRequestDate = undefined;
    }
  }
  next();
});

// Add indexes for performance - single field indexes
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });

// Compound index for admin user queries: role + accountStatus + createdAt
// Used in /api/admin/users for filtering and sorting admin user lists
UserSchema.index({ role: 1, accountStatus: 1, createdAt: -1 });

// Export the model
export default mongoose.models.User || mongoose.model("User", UserSchema);
