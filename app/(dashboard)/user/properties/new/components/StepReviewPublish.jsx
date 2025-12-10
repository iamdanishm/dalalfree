"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiEye,
  FiEdit3,
  FiHome,
  FiInfo,
  FiSettings,
  FiCheckCircle,
  FiImage,
  FiCheck,
  FiSave,
  FiChevronRight,
} from "react-icons/fi";

const imageCategories = [
  { value: "exterior", label: "Exterior", icon: "🏠" },
  { value: "interior", label: "Interior", icon: "🛋️" },
  { value: "bedroom", label: "Bedroom", icon: "🛏️" },
  { value: "kitchen", label: "Kitchen", icon: "👨‍🍳" },
  { value: "bathroom", label: "Bathroom", icon: "🛁" },
  { value: "living-room", label: "Living Room", icon: "🛋️" },
  { value: "balcony", label: "Balcony", icon: "🌅" },
  { value: "amenities", label: "Amenities", icon: "🏊" },
  { value: "other", label: "Other", icon: "📷" },
];

export default function StepReviewPublish({
  formData,
  updateFormData,
  errors,
  setErrors,
  onStepChange,
  onPublish,
  isPublishing = false,
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format area for display
  const formatArea = (area, unit = "sq ft") => {
    if (!area) return "Not specified";
    return `${area} ${unit}`;
  };

  // Get category display name
  const getCategoryDisplay = (category) => {
    const categoryMap = {
      Residential: "🏠 Residential",
      Commercial: "🏢 Commercial",
      Industrial: "🏭 Industrial",
      Land: "🌱 Land",
    };
    return categoryMap[category] || category;
  };

  // Get amenity display names
  const getAmenityNames = (amenityIds) => {
    const amenityMap = {
      "24-7-security": "24/7 Security",
      cctv: "CCTV Surveillance",
      intercom: "Intercom",
      "fire-safety": "Fire Safety",
      "gated-community": "Gated Community",
      "power-backup": "Power Backup",
      "water-supply": "24/7 Water Supply",
      lift: "Lift/Elevator",
      parking: "Parking Space",
      "waste-management": "Waste Management",
      "swimming-pool": "Swimming Pool",
      gym: "Gym/Fitness Center",
      "children-play-area": "Children's Play Area",
      garden: "Garden/Landscaped Area",
      "club-house": "Club House",
      "jogging-track": "Jogging Track",
      "visitor-parking": "Visitor Parking",
      "maintenance-staff": "Maintenance Staff",
      laundry: "Laundry Service",
      housekeeping: "Housekeeping",
      wifi: "Wi-Fi Connectivity",
      "ro-water": "RO Water System",
      "solar-panels": "Solar Panels",
      "rain-water-harvesting": "Rain Water Harvesting",
      "senior-citizen-area": "Senior Citizen Area",
      "meditation-area": "Meditation/Yoga Area",
    };

    return amenityIds?.map((id) => amenityMap[id]).filter(Boolean) || [];
  };

  // Handle publish
  const handlePublish = () => {
    if (!acceptedTerms) {
      setErrors({ terms: "Please accept the terms and conditions to publish" });
      return;
    }

    if (saveAsDraft) {
      // Save as draft - this would be handled differently
      alert("Draft saving functionality to be implemented");
      return;
    }

    onPublish && onPublish();
  };

  const stepSections = [
    {
      id: 1,
      title: "Property Type & Category",
      icon: FiHome,
      data: [
        { label: "Property Type", value: formData.propertyType },
        { label: "Category", value: getCategoryDisplay(formData.category) },
      ],
    },
    {
      id: 2,
      title: "Basic Information",
      icon: FiInfo,
      data: [
        { label: "Title", value: formData.title },
        { label: "Description", value: formData.description },
        { label: "Price", value: formatPrice(formData.price) },
        { label: "Address", value: formData.location },
        { label: "City", value: formData.city },
        { label: "State", value: formData.state },
        { label: "Pincode", value: formData.pincode },
      ],
    },
    {
      id: 3,
      title: "Specifications",
      icon: FiSettings,
      data: [
        ...(formData.category === "Residential"
          ? [
              { label: "BHK", value: formData.bhk },
              { label: "Bathrooms", value: formData.bathrooms },
              { label: "Balcony", value: formData.balcony },
              { label: "Furnishing", value: formData.furnishing },
            ]
          : []),
        { label: "Area", value: formatArea(formData.area) },
        {
          label: "Floor",
          value: formData.floor
            ? `${formData.floor} of ${formData.totalFloors}`
            : null,
        },
        {
          label: "Property Age",
          value: formData.age ? `${formData.age} years` : null,
        },
        { label: "Parking", value: formData.parking },
        { label: "Facing", value: formData.facing },
        { label: "Possession", value: formData.possession },
        {
          label: "Maintenance",
          value: formData.maintenance ? `₹${formData.maintenance}` : null,
        },
      ].filter((item) => item.value),
    },
    {
      id: 4,
      title: "Amenities & Highlights",
      icon: FiCheckCircle,
      data: [
        {
          label: "Society Amenities",
          value:
            getAmenityNames(formData.societyAmenities).join(", ") ||
            "None selected",
        },
        {
          label: "Nearby Places",
          value: formData.nearbyPlaces?.length
            ? `${formData.nearbyPlaces.length} places added`
            : "None added",
        },
        {
          label: "Key Highlights",
          value: formData.highlights?.join(", ") || "None added",
        },
      ],
    },
    {
      id: 5,
      title: "Photos & Videos",
      icon: FiImage,
      data: [
        {
          label: "Images",
          value: formData.images?.length
            ? `${formData.images.length} images uploaded`
            : "No images",
        },
        {
          label: "Videos",
          value: formData.videos?.length
            ? `${formData.videos.length} videos uploaded`
            : "No videos",
        },
      ],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-heading mb-2">
          Review & Publish
        </h1>
        <p className="text-muted text-lg">
          Review your property details and publish when ready
        </p>
      </motion.div>

      {/* Property Overview Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-heading">
              {formData.title || "Property Title"}
            </h3>
            <p className="text-muted">{formData.location || "Location"}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(formData.price)}
            </div>
            <div className="text-sm text-muted">
              {getCategoryDisplay(formData.category)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-heading">
              {formData.images?.length || 0}
            </div>
            <div className="text-sm text-muted">Photos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-heading">
              {formData.videos?.length || 0}
            </div>
            <div className="text-sm text-muted">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-heading">
              {formData.societyAmenities?.length || 0}
            </div>
            <div className="text-sm text-muted">Amenities</div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Sections */}
      <div className="space-y-6">
        {stepSections.map((section) => (
          <motion.div
            key={section.id}
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <section.icon className="text-gray-600" size={18} />
                </div>
                <h4 className="font-semibold text-heading">{section.title}</h4>
              </div>
              <button
                onClick={() => onStepChange && onStepChange(section.id)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <FiEdit3 size={14} />
                <span className="text-sm">Edit</span>
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.data.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-sm font-medium text-muted">
                      {item.label}:
                    </div>
                    <div className="text-sm text-heading break-words">
                      {item.value || "Not specified"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Special handling for media section */}
              {section.id === 5 && (
                <div className="mt-4 space-y-4">
                  {formData.images && formData.images.length > 0 && (
                    <div>
                      <h5 className="font-medium text-heading mb-2">Images:</h5>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.slice(0, 8).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.url || image.src}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {formData.images.length > 8 && (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted">
                              +{formData.images.length - 8} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.videos && formData.videos.length > 0 && (
                    <div>
                      <h5 className="font-medium text-heading mb-2">Videos:</h5>
                      <div className="text-sm text-muted">
                        {formData.videos.length} video
                        {formData.videos.length > 1 ? "s" : ""} uploaded
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terms and Conditions */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-50 border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <div className="flex-1">
            <label
              htmlFor="terms"
              className="text-sm font-medium text-heading cursor-pointer"
            >
              I agree to the Terms and Conditions
            </label>
            <p className="text-sm text-muted mt-1">
              By publishing this property, you agree to our terms of service and
              confirm that all information provided is accurate and up-to-date.
              The property will be submitted for admin approval before becoming
              visible to buyers.
            </p>
          </div>
        </div>

        {errors.terms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm">{errors.terms}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Publish Options */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h4 className="font-semibold text-blue-900 mb-4">Ready to Publish?</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="draft"
              checked={saveAsDraft}
              onChange={(e) => setSaveAsDraft(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="draft"
              className="text-sm font-medium text-blue-900 cursor-pointer"
            >
              Save as Draft (Publish later)
            </label>
          </div>

          <div className="text-sm text-blue-700">
            {saveAsDraft
              ? "Your property will be saved as a draft and you can publish it later from your dashboard."
              : "Your property will be submitted for approval and become visible to buyers once approved by our team."}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex justify-end space-x-4"
      >
        <button
          onClick={() => onStepChange && onStepChange(5)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back to Edit
        </button>

        <button
          onClick={handlePublish}
          disabled={isPublishing || !acceptedTerms}
          className={`flex items-center space-x-3 px-8 py-3 rounded-lg font-medium transition-all ${
            isPublishing || !acceptedTerms
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : saveAsDraft
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Publishing...</span>
            </>
          ) : saveAsDraft ? (
            <>
              <FiSave size={16} />
              <span>Save as Draft</span>
            </>
          ) : (
            <>
              <FiCheck size={16} />
              <span>Publish Property</span>
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
