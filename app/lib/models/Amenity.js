import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
amenitySchema.index({ title: "text" });
amenitySchema.index({ title: 1 });
amenitySchema.index({ available: 1 });
amenitySchema.index({ createdAt: -1 });


// Prevent duplicate titles (case-insensitive)
amenitySchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("title")) {
    const existing = await mongoose.models.Amenity.findOne({
      title: { $regex: new RegExp(`^${this.title}$`, "i") },
      _id: { $ne: this._id },
    });

    if (existing) {
      const error = new Error("An amenity with this title already exists");
      error.code = "DUPLICATE_TITLE";
      return next(error);
    }
  }
  next();
});

const Amenity = mongoose.models.Amenity || mongoose.model("Amenity", amenitySchema);

export default Amenity;