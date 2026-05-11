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
UserFavoritesSchema.statics.addFavorite = async function (userId, propertyId, notes = "") {
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
UserFavoritesSchema.statics.removeFavorite = async function (userId, propertyId) {
  return await this.findOneAndDelete({ userId, propertyId });
};

// Static method to check if property is favorited by user
UserFavoritesSchema.statics.isFavorited = async function (userId, propertyId) {
  const favorite = await this.findOne({ userId, propertyId });
  return !!favorite;
};

// Instance method to populate property details
UserFavoritesSchema.methods.populateProperty = function () {
  return this.populate({
    path: "propertyId",
    select: "title slug propertyType category price location status images city state createdAt ownerId",
    populate: {
      path: "ownerId",
      select: "name role"
    }
  });
};

// Static method to get user's favorites with populated property details
UserFavoritesSchema.statics.getUserFavorites = async function (userId, options = {}) {
  const { page = 1, limit = 10, sortBy = "newest" } = options;
  const skip = (page - 1) * limit;

  // Use aggregation to allow sorting by property fields and efficient filtering
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "properties",
        localField: "propertyId",
        foreignField: "_id",
        as: "property"
      }
    },
    { $unwind: "$property" },
    { $match: { "property.isArchived": { $ne: true } } }
  ];

  // Apply sorting
  let sortStage = { $sort: { addedAt: -1 } };
  if (sortBy === "oldest") sortStage = { $sort: { addedAt: 1 } };
  if (sortBy === "title") sortStage = { $sort: { "property.title": 1 } };
  if (sortBy === "price_high") sortStage = { $sort: { "property.price": -1 } };
  if (sortBy === "price_low") sortStage = { $sort: { "property.price": 1 } };
  
  pipeline.push(sortStage);

  // Count total matching documents
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await this.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Final project and clean up
  pipeline.push({
    $project: {
      _id: 1,
      userId: 1,
      propertyId: 1,
      addedAt: 1,
      notes: 1,
      property: {
        _id: 1,
        title: 1,
        slug: 1,
        propertyType: 1,
        category: 1,
        price: 1,
        location: 1,
        status: 1,
        images: 1,
        city: 1,
        state: 1,
        createdAt: 1,
        ownerId: 1
      }
    }
  });

  const favorites = await this.aggregate(pipeline);

  // Manually populate ownerId if needed (or include in aggregation)
  // For simplicity and to match previous format, we'll transform the output slightly
  const formattedFavorites = favorites.map(fav => ({
    ...fav,
    propertyId: fav.property // Match the previous format where propertyId was populated
  }));

  return {
    favorites: formattedFavorites,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
};

// Pre-save middleware to validate property exists
UserFavoritesSchema.pre('save', async function (next) {
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

const UserFavorites = mongoose.models.UserFavorites || mongoose.model("UserFavorites", UserFavoritesSchema);
export default UserFavorites;