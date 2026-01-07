import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "safety",
        "utilities",
        "convenience",
        "recreational",
        "fitness",
        "family",
        "services",
        "technology",
        "eco",
        "wellness",
      ],
    },
    title: {
      type: String,
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster searches
amenitySchema.index({ name: 1 });
amenitySchema.index({ category: 1 });
amenitySchema.index({ available: 1 });
amenitySchema.index({ createdAt: -1 });

// Prevent duplicate names (case-insensitive)
amenitySchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    const existing = await mongoose.models.Amenity.findOne({
      name: { $regex: new RegExp(`^${this.name}$`, "i") },
      _id: { $ne: this._id },
    });

    if (existing) {
      const error = new Error("An amenity with this name already exists");
      error.code = "DUPLICATE_NAME";
      return next(error);
    }
  }
  next();
});

// Clear any cached models for development
if (mongoose.models && mongoose.models.Amenity) {
  delete mongoose.models.Amenity;
}

if (mongoose.connection && mongoose.connection.models) {
  delete mongoose.connection.models.Amenity;
}

if (mongoose.modelSchemas && mongoose.modelSchemas.Amenity) {
  delete mongoose.modelSchemas.Amenity;
}

const Amenity = mongoose.model("Amenity", amenitySchema);

export default Amenity;
