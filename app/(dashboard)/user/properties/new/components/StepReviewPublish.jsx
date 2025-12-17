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
  FiVideo,
  FiMapPin,
  FiCheck,
  FiSave,
  FiChevronRight,
} from "react-icons/fi";
import Image from "next/image";

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
  acceptedTerms,
  setAcceptedTerms,
}) {
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
        { label: "Address", value: formData.address },
        { label: "Area/Locality", value: formData.location },
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
        { label: "Built-up Area", value: formatArea(formData.builtUpArea) },
        { label: "Carpet Area", value: formatArea(formData.carpetArea) },
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
      {/* Enhanced Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-primary to-primary/80 rounded-full mb-4 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiEye className="text-white" size={24} />
        </motion.div>
        <h1 className="text-4xl font-bold text-heading mb-3 bg-linear-to-r from-heading to-heading/80 bg-clip-text">
          Review & Publish
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Your property is ready! Review all details below and publish when
          you&apos;re satisfied
        </p>
        <motion.div
          className="mt-4 inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FiCheck size={14} />
          <span>All steps completed successfully</span>
        </motion.div>
      </motion.div>

      {/* Enhanced Property Overview Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-blue-50 border border-primary/20 rounded-2xl p-8 shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/50 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <motion.h3
                className="text-2xl font-bold text-heading mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {formData.title || "Property Title"}
              </motion.h3>
              <motion.p
                className="text-muted text-lg flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FiMapPin className="mr-2 text-primary" size={16} />
                {formData.location || "Location"}
              </motion.p>
            </div>
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-primary mb-1">
                {formatPrice(formData.price)}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {getCategoryDisplay(formData.category)}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <motion.div
                className="text-2xl font-bold text-primary mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {formData.images?.length || 0}
              </motion.div>
              <div className="text-sm text-muted font-medium">Photos</div>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <motion.div
                className="text-2xl font-bold text-blue-600 mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {formData.videos?.length || 0}
              </motion.div>
              <div className="text-sm text-muted font-medium">Videos</div>
            </div>
            <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <motion.div
                className="text-2xl font-bold text-green-600 mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {formData.societyAmenities?.length || 0}
              </motion.div>
              <div className="text-sm text-muted font-medium">Amenities</div>
            </div>
          </motion.div>
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
                    <div className="text-sm text-heading wrap-break-word">
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
                      <div className="grid grid-cols-6 gap-2">
                        {formData.images.slice(0, 12).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                          >
                            <Image
                              src={image.url || image.src}
                              alt={image.name || `Image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {formData.images.length > 12 && (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted">
                              +{formData.images.length - 12} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.videos && formData.videos.length > 0 && (
                    <div>
                      <h5 className="font-medium text-heading mb-2">Videos:</h5>
                      <div className="space-y-2">
                        {formData.videos.map((video, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <FiVideo className="text-red-600" size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-heading truncate">
                                {video.name}
                              </p>
                              <p className="text-xs text-muted">
                                Video {index + 1}
                              </p>
                            </div>
                          </div>
                        ))}
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
              By publishing this property on DalalFree, you certify that all
              provided information is accurate, current, and complete. Your
              listing will undergo our quality review process before becoming
              visible to verified buyers and real estate professionals across
              our platform.
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
    </motion.div>
  );
}
