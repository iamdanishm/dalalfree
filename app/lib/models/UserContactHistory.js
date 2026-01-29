import mongoose from "mongoose";

const UserContactHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    contactType: {
      type: String,
      enum: ["phone", "email", "whatsapp"],
      required: true
    },
    contactRevealedAt: {
      type: Date,
      default: Date.now
    },
    creditsUsed: {
      type: Number,
      default: 1,
      min: 1
    },
    contactValue: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Compound index for chronological sorting of user's contact history
UserContactHistorySchema.index({ userId: 1, contactRevealedAt: -1 });

// Index for property-specific contact history
UserContactHistorySchema.index({ userId: 1, propertyId: 1 });



// Index for property-based queries (to get all contacts for a property)
UserContactHistorySchema.index({ propertyId: 1 });

// Static method to log contact reveal
UserContactHistorySchema.statics.logContact = async function (userId, propertyId, contactType, contactValue, creditsUsed = 1) {
  try {
    // Validate credits used
    if (creditsUsed < 1) {
      throw new Error("Credits used must be at least 1");
    }

    // Check if user has sufficient credits
    const User = mongoose.model("User");
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has active subscription with credits
    if (!user.subscription || user.subscription.status !== "active") {
      throw new Error("Active subscription required to reveal contacts");
    }

    if (user.subscription.adUnlockCredits < creditsUsed) {
      throw new Error("Insufficient credits");
    }

    // Deduct credits from user
    user.subscription.adUnlockCredits -= creditsUsed;
    await user.save();

    // Create contact history record
    const contactHistory = new this({
      userId,
      propertyId,
      contactType,
      contactValue,
      creditsUsed
    });

    return await contactHistory.save();
  } catch (error) {
    throw error;
  }
};

// Static method to get user's contact history
UserContactHistorySchema.statics.getUserContactHistory = async function (userId, options = {}) {
  const { page = 1, limit = 10, dateFrom, dateTo, contactType } = options;

  // Build query
  const query = { userId };

  // Add date range filter if provided
  if (dateFrom || dateTo) {
    query.contactRevealedAt = {};
    if (dateFrom) query.contactRevealedAt.$gte = new Date(dateFrom);
    if (dateTo) query.contactRevealedAt.$lte = new Date(dateTo);
  }

  // Add contact type filter if provided
  if (contactType) {
    query.contactType = contactType;
  }

  const totalCount = await this.countDocuments(query);

  const contacts = await this.find(query)
    .populate({
      path: "propertyId",
      select: "title slug propertyType category price location images city state",
      match: { isArchived: { $ne: true } } // Only show non-archived properties
    })
    .sort({ contactRevealedAt: -1 }) // Most recent first
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Filter out contacts where property was not found or is archived
  const validContacts = contacts.filter(contact => contact.propertyId);

  return {
    contacts: validContacts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Static method to check if user has contacted property
UserContactHistorySchema.statics.hasContactedProperty = async function (userId, propertyId) {
  const contact = await this.findOne({ userId, propertyId });
  return !!contact;
};

// Instance method to get masked contact value for privacy
UserContactHistorySchema.methods.getMaskedContact = function () {
  const value = this.contactValue;

  switch (this.contactType) {
    case "phone":
      // Mask phone: show first 2 and last 2 digits
      if (value.length <= 4) return value;
      return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);

    case "email":
      // Mask email: show first 2 chars of username and domain
      const [username, domain] = value.split("@");
      if (!domain) return value;
      const maskedUsername = username.length > 2
        ? username.substring(0, 2) + "*".repeat(username.length - 2)
        : username;
      return `${maskedUsername}@${domain}`;

    case "whatsapp":
      // Treat as phone number
      if (value.length <= 4) return value;
      return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);

    default:
      return value;
  }
};

// Instance method to populate property details
UserContactHistorySchema.methods.populateProperty = function () {
  return this.populate({
    path: "propertyId",
    select: "title slug propertyType category price location images city state"
  });
};

// Static method to get contact statistics for user
UserContactHistorySchema.statics.getUserContactStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        totalCreditsUsed: { $sum: "$creditsUsed" },
        contactsByType: {
          $push: "$contactType"
        },
        recentContacts: {
          $push: {
            contactType: "$contactType",
            contactRevealedAt: "$contactRevealedAt",
            creditsUsed: "$creditsUsed"
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalContacts: 0,
      totalCreditsUsed: 0,
      contactsByType: {},
      recentContacts: []
    };
  }

  const stat = stats[0];

  // Count contacts by type
  const contactsByType = stat.contactsByType.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Get recent 5 contacts
  const recentContacts = stat.recentContacts
    .sort((a, b) => new Date(b.contactRevealedAt) - new Date(a.contactRevealedAt))
    .slice(0, 5);

  return {
    totalContacts: stat.totalContacts,
    totalCreditsUsed: stat.totalCreditsUsed,
    contactsByType,
    recentContacts
  };
};

// Pre-save middleware to validate property exists
UserContactHistorySchema.pre('save', async function (next) {
  try {
    const Property = mongoose.model("Property");
    const property = await Property.findById(this.propertyId);

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.isArchived) {
      throw new Error("Cannot log contact for archived property");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Clear any existing model to prevent caching issues
if (mongoose.models && mongoose.models.UserContactHistory) {
  delete mongoose.models.UserContactHistory;
}

if (mongoose.connection && mongoose.connection.models) {
  delete mongoose.connection.models.UserContactHistory;
}

const UserContactHistory = mongoose.model("UserContactHistory", UserContactHistorySchema);
export default UserContactHistory;