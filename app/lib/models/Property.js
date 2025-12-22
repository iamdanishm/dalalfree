import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    // Ownership
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic fields (enhanced)
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true }, // SEO-friendly URL slug
    description: String,
    subtitle: String, // "Premium 2BHK Apartment"
    price: Number,
    marketRange: String, // Price range category like "₹30-60 Lakhs"
    negotiable: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    originalPrice: Number,
    discount: String,

    // Property classification
    propertyType: {
      type: String,
      enum: ["sell", "rent"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial", "Land"],
      required: true,
    },
    score: String, // A+, B, etc.

    // Detailed specifications (for QuickOverview component)
    bhk: String, // "2BHK", "3BHK", etc.
    bathrooms: Number,
    balcony: Number,
    furnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
    },
    area: Number,
    builtUpArea: Number,
    carpetArea: Number,
    floor: String,
    totalFloors: Number, // Total floors in building
    age: Number,
    ageUnit: String, // "years old"
    parking: String, // "1 Covered Parking", "Open Parking"
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
    maintenance: String, // "₹2,500/month"

    // Location and maps
    location: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },

    // Key selling points (for PropertyHighlights component)
    highlights: [String],
    societyAmenities: [String], // Array of amenity IDs selected by user
    nearbyPlaces: [
      {
        type: String, // "school", "hospital", "mall", etc.
        name: String, // Place name
        distance: String, // "1 km", "0.5 km", etc.
        rating: Number, // 1-5 rating
      },
    ], // Nearby places added by user

    // Rich media structure (for ImageGallery component)
    images: [
      {
        id: String, // Unique identifier
        name: String, // Original filename
        size: Number, // File size in bytes
        type: String, // MIME type
        url: String, // File URL/path
        category: { type: String, default: "other" }, // Image category
        order: Number, // Display order
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    videos: [
      {
        id: String, // Unique identifier
        name: String, // Original filename
        size: Number, // File size in bytes
        type: String, // MIME type
        url: String, // File URL/path
        order: Number, // Display order
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    companionPhotos: [String], // Additional property images
    imageCategories: [String], // ["Exterior", "Living Room", etc.]

    // Amenities structure (for AmenitiesComponent)
    // Note: society array should be populated based on societyAmenities IDs during save
    // nearby array should be populated based on nearbyPlaces during save
    amenities: {
      society: [
        {
          name: String,
          available: { type: Boolean, default: true },
          icon: String,
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

    // Neighborhood information (for LocationNeighborhood component)
    neighborhood: {
      walkScore: Number, // 0-100
      livability: {
        type: String,
        enum: ["excellent", "good", "average", "poor"],
      },
      commute: [
        {
          destination: String,
          time: String,
          distance: String,
        },
      ],
      demographics: String, // "Family-friendly area with good schools and healthcare"
    },

    // Trust verification (for TrustBadges component)
    trustBadges: [
      {
        label: String, // "Verified Listing", "No Brokerage", "Ready to Move"
        icon: String, // component name reference
        color: String, // "text-green-800"
        bg: String, // "bg-green-100"
      },
    ],

    // KYC Documents (for KycVerification component)
    kycFiles: {
      aadhaar: [
        {
          url: String, // File URL/path
          name: String, // Original filename
          size: Number, // File size in bytes
          type: String, // MIME type
          uploadedAt: { type: Date, default: Date.now },
        },
      ], // Array for Aadhaar images/PDF
      pan: {
        url: String,
        name: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      }, // Single PAN document
      agreement: {
        url: String,
        name: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      }, // Property agreement PDF
      video: {
        url: String,
        name: String,
        size: Number,
        type: String,
        duration: Number, // Video duration in seconds
        uploadedAt: { type: Date, default: Date.now },
      }, // Verification video
    },

    // Analytics fields
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    inquiriesCount: { type: Number, default: 0 },
    lastViewed: Date,
    lastUpdatedByUser: Date,

    // Archive system
    isArchived: { type: Boolean, default: false },
    archivedReason: String,
    archivedAt: Date,

    // Admin fields
    verified: { type: Boolean, default: false }, // Keep for backward compatibility
    featured: { type: Boolean, default: false }, // Paid featured listings
    boosted: { type: Boolean, default: false }, // Temporary promotion
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
    rejectionReason: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "featured"],
      default: "pending",
    },

    // Additional UI fields
    verificationStatus: { type: Boolean, default: false },
    featuredStatus: { type: Boolean, default: false },
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

export default mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
