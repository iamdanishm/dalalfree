import mongoose from "mongoose";

const UserFavoritesSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true
    }
  },
  { timestamps: true }
);

// Compound index to prevent duplicate favorites per user-property combination
UserFavoritesSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Index for sorting favorites by date added (most recent first)
UserFavoritesSchema.index({ userId: 1, addedAt: -1 });

// Index for property-based queries (to check if property is favorited)
UserFavoritesSchema.index({ propertyId: 1 });

// Static method to add favorite with duplicate prevention
UserFavoritesSchema.statics.addFavorite = async function(userId, propertyId, notes = "") {
  try {
    // Check if favorite already exists
    const existingFavorite = await this.findOne({ userId, propertyId });

    if (existingFavorite) {
      // Update notes if provided
      if (notes && notes !== existingFavorite.notes) {
        existingFavorite.notes = notes;
        existingFavorite.addedAt = new Date(); // Update timestamp
        return await existingFavorite.save();
      }
      return existingFavorite;
    }

    // Create new favorite
    const favorite = new this({
      userId,
      propertyId,
      notes: notes || ""
    });

    return await favorite.save();
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - favorite already exists
      throw new Error("Property is already in favorites");
    }
    throw error;
  }
};

// Static method to remove favorite
UserFavoritesSchema.statics.removeFavorite = async function(userId, propertyId) {
  return await this.findOneAndDelete({ userId, propertyId });
};

// Static method to check if property is favorited by user
UserFavoritesSchema.statics.isFavorited = async function(userId, propertyId) {
  const favorite = await this.findOne({ userId, propertyId });
  return !!favorite;
};

// Instance method to populate property details
UserFavoritesSchema.methods.populateProperty = function() {
  return this.populate({
    path: "propertyId",
    select: "title slug propertyType category price location status images city state createdAt"
  });
};

// Static method to get user's favorites with populated property details
UserFavoritesSchema.statics.getUserFavorites = async function(userId, options = {}) {
  const { page = 1, limit = 10, sortBy = "newest" } = options;

  let sortOption = { addedAt: -1 }; // default: newest first

  switch (sortBy) {
    case "newest":
      sortOption = { addedAt: -1 };
      break;
    case "oldest":
      sortOption = { addedAt: 1 };
      break;
    case "title":
      // This requires population first, will be handled in query
      break;
  }

  const query = this.find({ userId }).populate({
    path: "propertyId",
    select: "title slug propertyType category price location status images city state createdAt",
    match: { isArchived: { $ne: true } } // Only show non-archived properties
  });

  // If sorting by title, we need to sort after population
  if (sortBy === "title") {
    query.sort({ "propertyId.title": 1 });
  } else {
    query.sort(sortOption);
  }

  // Apply pagination
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);

  const favorites = await query.lean();

  // Filter out favorites where property was not found or is archived
  const validFavorites = favorites.filter(fav => fav.propertyId);

  // Get total count for pagination
  const totalCount = await this.countDocuments({
    userId,
    propertyId: {
      $in: await mongoose.model("Property").find({ isArchived: { $ne: true } }).distinct("_id")
    }
  });

  return {
    favorites: validFavorites,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Pre-save middleware to validate property exists
UserFavoritesSchema.pre('save', async function(next) {
  try {
    const Property = mongoose.model("Property");
    const property = await Property.findById(this.propertyId);

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.isArchived) {
      throw new Error("Cannot favorite archived property");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Clear any existing model to prevent caching issues
if (mongoose.models && mongoose.models.UserFavorites) {
  delete mongoose.models.UserFavorites;
}

if (mongoose.connection && mongoose.connection.models) {
  delete mongoose.connection.models.UserFavorites;
}

const UserFavorites = mongoose.model("UserFavorites", UserFavoritesSchema);
export default UserFavorites;