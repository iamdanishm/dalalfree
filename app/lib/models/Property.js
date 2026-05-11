import mongoose from "mongoose";

// --- Sub-Schemas (Defined Explicitly) ---
const imageSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    category: { type: String, default: "other" },
    order: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
); // _id: false prevents creating extra IDs for images

const videoSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    order: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const nearbyPlaceSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    distance: { type: String, required: true },
    rating: { type: Number, default: 0 },
  },
  { _id: false }
);

const kycFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    duration: Number, // For video files
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileHash: {
      type: String,
      index: true, // For fast hash lookups
      sparse: true, // Only create index for non-null values
    },
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    subtitle: String,
    price: { type: Number, min: 0 },
    marketRange: String,
    negotiable: { type: String, enum: ["Yes", "No"], default: "No" },
    originalPrice: { type: Number, min: 0 },
    discount: String,
    propertyType: { type: String, enum: ["sell", "rent"], required: true },
    category: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial", "Land"],
      required: true,
    },
    score: String,
    bhk: String,
    bathrooms: { type: Number, min: 0 },
    balcony: { type: Number, min: 0 },
    furnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
    },
    builtUpArea: { type: Number, min: 0 },
    carpetArea: { type: Number, min: 0 },
    floor: String,
    totalFloors: { type: Number, min: 0 },
    age: { type: Number, min: 0 },
    ageUnit: String,
    parking: String,
    facing: {
      type: String,
      enum: [
        "north",
        "south",
        "east",
        "west",
        "north-east",
        "north-west",
        "south-east",
        "south-west",
      ],
    },
    possessionStatus: {
      type: String,
      enum: [
        "ready-to-move",
        "under-construction",
        "possession-in-3-months",
        "possession-in-6-months",
      ],
    },
    // Rent specific fields
    deposit: { type: Number, min: 0 },
    preferredTenants: {
      type: String,
      enum: ["Family", "Bachelors", "Any"],
    },
    availableFrom: String,
    maintenance: String,
    location: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number },
    highlights: [String],

    // Use explicit sub-schemas
    nearbyPlaces: [nearbyPlaceSchema],
    images: [imageSchema],
    videos: [videoSchema],

    companionPhotos: [String],
    imageCategories: [String],
    amenities: {
      society: [
        {
          name: String,
          title: String,
          available: { type: Boolean, default: true },
          icon: String,
          image: String,
        },
      ],
      nearby: [
        {
          name: String,
          distance: String,
          rating: Number,
          icon: String,
          category: String,
        },
      ],
    },
    kycFiles: {
      aadhaar: [kycFileSchema], // Array for 1-2 Aadhaar files
      pan: kycFileSchema, // Single PAN file
      agreement: kycFileSchema, // Single agreement file
      video: kycFileSchema, // Single video file
    },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    inquiriesCount: { type: Number, default: 0 },
    lastViewed: Date,
    lastUpdatedByUser: Date,
    isArchived: { type: Boolean, default: false },
    archivedReason: String,
    archivedAt: Date,
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    boosted: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: Date,
    rejectionReason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Partner commission fields
    partnerCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    commissionPaid: {
      type: Boolean,
      default: false
    },
    commissionPaidDate: {
      type: Date
    },
    commissionTransactionId: {
      type: String
    },
  },
  { timestamps: true }
);

// Add indexes for performance
propertySchema.index({ status: 1 });
propertySchema.index({ verified: 1 });
propertySchema.index({ featured: 1 });
propertySchema.index({ boosted: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ category: 1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ viewsCount: 1 });
propertySchema.index({ likesCount: 1 });
propertySchema.index({ inquiriesCount: 1 });
propertySchema.index({ isArchived: 1 });

// User property management indexes
propertySchema.index({ ownerId: 1, status: 1 }); // User's properties by status
propertySchema.index({ ownerId: 1, createdAt: -1 }); // User's properties by date
propertySchema.index({ ownerId: 1, isArchived: 1 }); // User's archived properties

// Compound index for admin property queries: status + propertyType + createdAt
propertySchema.index({ status: 1, propertyType: 1, createdAt: -1 });

// User property search and filtering
propertySchema.index({ ownerId: 1, propertyType: 1, category: 1 }); // Filter by type/category
propertySchema.index({
  ownerId: 1,
  status: 1,
  createdAt: -1,
}); // Main user dashboard query

// Archive and analytics
propertySchema.index({ ownerId: 1, lastViewed: -1 });
propertySchema.index({ ownerId: 1, inquiriesCount: -1 });

// Text search index for admin
propertySchema.index({ title: "text", description: "text" });

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);
export default Property;
