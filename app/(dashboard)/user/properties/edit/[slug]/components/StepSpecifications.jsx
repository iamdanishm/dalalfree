"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import {
  FiHome,
  FiSettings,
  FiTruck,
  FiCompass,
  FiCalendar,
  FiDollarSign,
  FiEdit3,
  FiCheck,
} from "react-icons/fi";

// BHK options for residential properties
const bhkOptions = [
  {
    value: "1BHK",
    label: "1 BHK",
    description: "Single bedroom with hall & kitchen",
  },
  {
    value: "2BHK",
    label: "2 BHK",
    description: "Two bedrooms with hall & kitchen",
  },
  {
    value: "3BHK",
    label: "3 BHK",
    description: "Three bedrooms with hall & kitchen",
  },
  {
    value: "4BHK",
    label: "4 BHK",
    description: "Four bedrooms with hall & kitchen",
  },
  { value: "5BHK", label: "5+ BHK", description: "Five or more bedrooms" },
  { value: "Studio", label: "Studio", description: "Single room apartment" },
  { value: "1RK", label: "1 RK", description: "Room with kitchen" },
];

// Furnishing options
const furnishingOptions = [
  {
    value: "furnished",
    label: "Fully Furnished",
    description: "Complete with furniture, appliances & decor",
  },
  {
    value: "semi-furnished",
    label: "Semi Furnished",
    description: "Basic furniture and appliances",
  },
  {
    value: "unfurnished",
    label: "Unfurnished",
    description: "Bare property, no furniture",
  },
];

// Facing directions
const facingOptions = [
  { value: "north", label: "North", icon: "⬆️" },
  { value: "south", label: "South", icon: "⬇️" },
  { value: "east", label: "East", icon: "➡️" },
  { value: "west", label: "West", icon: "⬅️" },
  { value: "north-east", label: "North-East", icon: "↗️" },
  { value: "north-west", label: "North-West", icon: "↖️" },
  { value: "south-east", label: "South-East", icon: "↘️" },
  { value: "south-west", label: "South-West", icon: "↙️" },
];

// Possession status options
const possessionOptions = [
  {
    value: "ready-to-move",
    label: "Ready to Move",
    description: "Property is ready for immediate occupancy",
  },
  {
    value: "under-construction",
    label: "Under Construction",
    description: "Property is currently being built",
  },
  {
    value: "possession-in-3-months",
    label: "Ready in 3 Months",
    description: "Possession expected within 3 months",
  },
  {
    value: "possession-in-6-months",
    label: "Ready in 6 Months",
    description: "Possession expected within 6 months",
  },
];

// Parking options
const parkingOptions = [
  { value: "No Parking", label: "No Parking" },
  { value: "Open Parking", label: "Open Parking" },
  { value: "1 Covered Parking", label: "1 Covered Parking" },
  { value: "2 Covered Parking", label: "2 Covered Parking" },
  { value: "3+ Covered Parking", label: "3+ Covered Parking" },
];

// Bathroom options
const bathroomOptions = [
  { value: 1, label: "1 Bathroom" },
  { value: 2, label: "2 Bathrooms" },
  { value: 3, label: "3 Bathrooms" },
  { value: 4, label: "4 Bathrooms" },
  { value: 5, label: "5+ Bathrooms" },
];

// Balcony options
const balconyOptions = [
  { value: 0, label: "No Balcony" },
  { value: 1, label: "1 Balcony" },
  { value: 2, label: "2 Balconies" },
  { value: 3, label: "3 Balconies" },
  { value: 4, label: "4+ Balconies" },
];

// Utility function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  if (!num || isNaN(num)) return num;
  const j = num % 10;
  const k = num % 100;
  if (j == 1 && k != 11) return num + "st";
  if (j == 2 && k != 12) return num + "nd";
  if (j == 3 && k != 13) return num + "rd";
  return num + "th";
};

export default function StepSpecifications({
  formData,
  updateFormData,
  errors,
  setErrors,
  originalProperty,
  isEditing = false,
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

  // Check for changes from original data
  const hasChanges = useMemo(() => {
    if (!originalProperty) return false;

    const fieldsToCheck = [
      "bhk",
      "bathrooms",
      "balcony",
      "furnishing",
      "builtUpArea",
      "carpetArea",
      "floor",
      "totalFloors",
      "age",
      "parking",
      "facing",
      "possessionStatus",
      "maintenance",
    ];

    return fieldsToCheck.some((field) => {
      return originalProperty[field] !== formData[field];
    });
  }, [formData, originalProperty]);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });

    // Clear field-specific errors
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleNumericChange = (field, value) => {
    const numValue = value === "" ? "" : parseFloat(value);
    if (numValue === "" || (!isNaN(numValue) && numValue >= 0)) {
      updateFormData({ [field]: numValue === "" ? "" : numValue });

      // Clear field-specific errors
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    }
  };

  const formatAreaDisplay = (area) => {
    if (!area && area !== 0) return "";
    return `${area} sq ft`;
  };

  // Fill dummy data function - Development only
  const fillDummyData = () => {
    const dummyData = {
      // Residential specifications
      bhk: "3BHK",
      bathrooms: 3,
      balcony: 2,
      furnishing: "semi-furnished",

      // Area details
      builtUpArea: 1800,
      carpetArea: 1500,

      // Floor details
      floor: 5,
      totalFloors: 12,

      // Property age
      age: 3,

      // Parking
      parking: "2 Covered Parking",

      // Property facing
      facing: "east",

      // Possession status
      possessionStatus: "ready-to-move",

      // Optional maintenance cost
      maintenance: "₹3,500/month",
    };

    // Update form data with dummy values
    updateFormData(dummyData);

    // Clear any existing errors
    setErrors({});
  };

  // Format area display
  const formatArea = (area) => {
    if (!area) return "";
    return `${area} sq.ft`;
  };

  // Get default suggestions based on category and BHK
  const getAreaSuggestions = useMemo(() => {
    if (formData.category === "Residential") {
      const bhk = formData.bhk;
      if (bhk === "1BHK" || bhk === "1RK" || bhk === "Studio") {
        return [400, 600, 800, 1000];
      } else if (bhk === "2BHK") {
        return [800, 1000, 1200, 1500];
      } else if (bhk === "3BHK") {
        return [1200, 1500, 1800, 2000];
      } else if (bhk === "4BHK") {
        return [1800, 2200, 2500, 3000];
      } else if (bhk === "5BHK") {
        return [2500, 3000, 3500, 4000];
      }
    } else if (formData.category === "Commercial") {
      return [500, 1000, 2000, 5000];
    } else if (formData.category === "Land") {
      return [1000, 5000, 10000, 50000]; // In sq.ft or acres
    }
    return [500, 1000, 1500, 2000];
  }, [formData.category, formData.bhk]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="relative mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-heading mb-2">
            Property Specifications
          </h1>
          <p className="text-muted text-lg">
            Update your property's detailed specifications and features
          </p>
        </div>

        {/* Fill Data Button - Development Only */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            variants={itemVariants}
            className="absolute top-0 right-0"
          >
            <button
              onClick={fillDummyData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              title="Fill with dummy data (Development Only)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Fill Data
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Residential Properties Section */}
      {formData.category === "Residential" && (
        <motion.div variants={itemVariants} className="space-y-8">
          {/* BHK Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <FiHome className="text-white" size={18} />
              </div>
              <label className="text-xl font-bold text-heading">
                BHK Configuration <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3">
              {bhkOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleInputChange("bhk", option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${formData.bhk === option.value
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                    }`}
                >
                  <div className="font-semibold text-heading mb-1">
                    {option.label}
                  </div>
                  <div className="text-sm text-muted">{option.description}</div>
                </motion.button>
              ))}
            </div>

            {errors.bhk && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">{errors.bhk}</p>
              </motion.div>
            )}

            {/* BHK Change Indicator */}
            {originalProperty?.bhk !== formData.bhk && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <FiEdit3
                    className="text-yellow-600 mt-0.5 flex-shrink-0"
                    size={14}
                  />
                  <div className="text-sm">
                    <span className="font-medium text-yellow-800">
                      BHK changed:{" "}
                    </span>
                    <span className="text-yellow-700 line-through">
                      {originalProperty?.bhk || "Not set"}
                    </span>
                    <span className="mx-2">*</span>
                    <span className="text-green-700 font-medium">
                      {formData.bhk || "Not set"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bathrooms and Balcony */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bathrooms */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-heading">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  formData.bathrooms
                    ? {
                      value: formData.bathrooms,
                      label: `${formData.bathrooms} Bathroom${formData.bathrooms > 1 ? "s" : ""
                        }`,
                    }
                    : null
                }
                onChange={(selectedOption) =>
                  handleInputChange("bathrooms", selectedOption?.value || "")
                }
                options={[
                  { value: 1, label: "1 Bathroom" },
                  { value: 2, label: "2 Bathrooms" },
                  { value: 3, label: "3 Bathrooms" },
                  { value: 4, label: "4 Bathrooms" },
                  { value: 5, label: "5+ Bathrooms" },
                ]}
                placeholder="Select number of bathrooms"
                isClearable
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    padding: "0.125rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    "&:hover": { borderColor: "#e90914" },
                    "&:focus-within": {
                      borderColor: "#e90914",
                      boxShadow: "0 0 0 1px #e90914",
                    },
                  }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                  singleValue: (base) => ({ ...base, color: "#111827" }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected
                      ? "#e90914"
                      : state.isFocused
                        ? "#fef2f2"
                        : "white",
                    color: state.isSelected
                      ? "white"
                      : state.isFocused
                        ? "#111827"
                        : "#374151",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#e90914" : "#fef2f2",
                      color: state.isSelected ? "white" : "#111827",
                    },
                    "&:active": {
                      backgroundColor: state.isSelected ? "#d10711" : "#fecaca",
                    },
                  }),
                }}
              />
              {errors.bathrooms && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-medium">
                    {errors.bathrooms}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Balcony */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-heading">
                Balcony <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  (formData.balcony !== undefined && formData.balcony !== null && formData.balcony !== "")
                    ? {
                      value: Number(formData.balcony),
                      label:
                        Number(formData.balcony) === 0
                          ? "No Balcony"
                          : Number(formData.balcony) === 1
                            ? "1 Balcony"
                            : `${formData.balcony} Balconies`,
                    }
                    : null
                }
                onChange={(selectedOption) =>
                  handleInputChange("balcony", selectedOption?.value ?? "")
                }
                options={[
                  { value: 0, label: "No Balcony" },
                  { value: 1, label: "1 Balcony" },
                  { value: 2, label: "2 Balconies" },
                  { value: 3, label: "3 Balconies" },
                  { value: 4, label: "4+ Balconies" },
                ]}
                placeholder="Select number of balconies"
                isClearable
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    padding: "0.125rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    "&:hover": { borderColor: "#e90914" },
                    "&:focus-within": {
                      borderColor: "#e90914",
                      boxShadow: "0 0 0 1px #e90914",
                    },
                  }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                  singleValue: (base) => ({ ...base, color: "#111827" }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "0.875rem",
                    backgroundColor: state.isSelected
                      ? "#e90914"
                      : state.isFocused
                        ? "#fef2f2"
                        : "white",
                    color: state.isSelected
                      ? "white"
                      : state.isFocused
                        ? "#111827"
                        : "#374151",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#e90914" : "#fef2f2",
                      color: state.isSelected ? "white" : "#111827",
                    },
                    "&:active": {
                      backgroundColor: state.isSelected ? "#d10711" : "#fecaca",
                    },
                  }),
                }}
              />
              {errors.balcony && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-medium">
                    {errors.balcony}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Furnishing Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <FiSettings className="text-white" size={18} />
              </div>
              <label className="text-xl font-bold text-heading">
                Furnishing Status <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-4 md:grid-cols-3 md:gap-4">
              {furnishingOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleInputChange("furnishing", option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${formData.furnishing === option.value
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                    }`}
                >
                  <div className="font-semibold text-heading mb-1">
                    {option.label}
                  </div>
                  <div className="text-sm text-muted">{option.description}</div>
                </motion.button>
              ))}
            </div>

            {errors.furnishing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.furnishing}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Area Specifications */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <span className="text-white text-lg">=*</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">
              Area Specifications
            </h2>
            <p className="text-muted text-sm">
              Specify the area measurements of your property
            </p>
          </div>
        </div>

        {/* Built-up Area & Carpet Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Built-up Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading">
              Built-up Area (sq ft) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.builtUpArea || ""}
              onChange={(e) =>
                handleNumericChange("builtUpArea", e.target.value)
              }
              placeholder="Enter built-up area"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.builtUpArea
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
                }`}
              min="0"
              step="0.01"
            />
            {formData.builtUpArea && (
              <div className="text-sm text-primary font-medium">
                {formatAreaDisplay(formData.builtUpArea)}
              </div>
            )}
            {errors.builtUpArea && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.builtUpArea}
                </p>
              </motion.div>
            )}
          </div>

          {/* Carpet Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading">
              Carpet Area (sq ft) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.carpetArea || ""}
              onChange={(e) =>
                handleNumericChange("carpetArea", e.target.value)
              }
              placeholder="Enter carpet area"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.carpetArea
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
                }`}
              min="0"
              step="0.01"
            />
            {formData.carpetArea && (
              <div className="text-sm text-primary font-medium">
                {formatAreaDisplay(formData.carpetArea)}
              </div>
            )}
            {errors.carpetArea && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.carpetArea}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Area Tip */}
        {formData.builtUpArea && formData.carpetArea && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <FiCheck className="text-blue-600" size={16} />
              <span className="text-sm text-blue-800 font-medium">
                Area Ratio:{" "}
                {((formData.carpetArea / formData.builtUpArea) * 100).toFixed(
                  1
                )}
                % carpet area
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Building Specifications */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <span className="text-white text-lg">*</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">
              Building Specifications
            </h2>
            <p className="text-muted text-sm">
              Details about the building and property positioning
            </p>
          </div>
        </div>

        {/* Floor Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Floor */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading">
              Floor <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.floor || ""}
              onChange={(e) => handleNumericChange("floor", e.target.value)}
              placeholder="e.g., 5"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.floor
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
                }`}
              min="0"
            />
            {errors.floor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.floor}
                </p>
              </motion.div>
            )}
          </div>

          {/* Total Floors */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading">
              Total Floors <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalFloors || ""}
              onChange={(e) =>
                handleNumericChange("totalFloors", e.target.value)
              }
              placeholder="e.g., 20"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.totalFloors
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
                }`}
              min="1"
            />
            {errors.totalFloors && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.totalFloors}
                </p>
              </motion.div>
            )}
          </div>

          {/* Property Age */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading">
              Property Age (years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) => handleNumericChange("age", e.target.value)}
              placeholder="e.g., 2"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.age
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-primary"
                }`}
              min="0"
              step="0.5"
            />
            {errors.age && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">{errors.age}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floor Validation Warning */}
        {formData.floor &&
          formData.totalFloors &&
          formData.floor > formData.totalFloors && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">
                Specific floor cannot be greater than total floors in the
                building
              </p>
            </motion.div>
          )}

        {/* Parking */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-heading">
            Parking <span className="text-red-500">*</span>
          </label>
          <div className="touch-manipulation">
            <Select
              value={
                formData.parking
                  ? { value: formData.parking, label: formData.parking }
                  : null
              }
              onChange={(selectedOption) => {
                handleInputChange("parking", selectedOption?.value || "");
              }}
              options={parkingOptions}
              placeholder="Select parking"
              isClearable={false}
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  border: errors.parking
                    ? "1px solid #ef4444"
                    : "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.125rem",
                  fontSize: "0.875rem",
                  backgroundColor: "white",
                  "&:hover": {
                    borderColor: errors.parking ? "#ef4444" : "#e90914",
                  },
                  "&:focus-within": {
                    borderColor: errors.parking ? "#ef4444" : "#e90914",
                    boxShadow: errors.parking
                      ? "0 0 0 1px #ef4444"
                      : "0 0 0 1px #e90914",
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#9ca3af",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#111827",
                  fontWeight: "500",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0.25rem 0.5rem",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: "0.875rem",
                  backgroundColor: state.isSelected
                    ? "#e90914"
                    : state.isFocused
                      ? "#fef2f2"
                      : "white",
                  color: state.isSelected
                    ? "white"
                    : state.isFocused
                      ? "#111827"
                      : "#374151",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: state.isSelected ? "#e90914" : "#fef2f2",
                    color: state.isSelected ? "white" : "#111827",
                  },
                  "&:active": {
                    backgroundColor: state.isSelected ? "#d10711" : "#fecaca",
                  },
                }),
              }}
            />
          </div>
          {errors.parking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">
                {errors.parking}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Property Facing - Required, Card Design */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg">
            <FiCompass className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Property Facing <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {facingOptions.map((option, index) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleInputChange("facing", option.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.facing === option.value
                ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="font-semibold text-heading text-sm mb-1">
                {option.label}
              </div>
              <div className="text-xs text-muted">
                {option.value.replace("-", " ")}
              </div>
            </motion.button>
          ))}
        </div>

        {errors.facing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">{errors.facing}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Possession Status */}
      {formData.propertyType !== "rent" && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <FiCalendar className="text-white" size={18} />
            </div>
            <label className="text-xl font-bold text-heading">
              Possession Status <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {possessionOptions.map((option, index) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  handleInputChange("possessionStatus", option.value)
                }
                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${formData.possessionStatus === option.value
                  ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                  : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                  }`}
              >
                <div className="font-semibold text-heading mb-1">
                  {option.label}
                </div>
                <div className="text-sm text-muted">{option.description}</div>
              </motion.button>
            ))}
          </div>

          {errors.possessionStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">
                {errors.possessionStatus}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Rent Specific Specifications */}
      {formData.propertyType === "rent" && (
        <>
          {/* Preferred Tenants */}
          <motion.div variants={itemVariants} className="space-y-4 pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg">
                <FiSettings className="text-white" size={18} />
              </div>
              <label className="text-xl font-bold text-heading">
                Preferred Tenants <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "Any",
                  label: "Anyone",
                  desc: "No specific preference",
                },
                {
                  value: "Family",
                  label: "Family",
                  desc: "Married couples/families",
                },
                {
                  value: "Bachelors",
                  label: "Bachelors",
                  desc: "Single professionals/students",
                },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() =>
                    handleInputChange("preferredTenants", option.value)
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${formData.preferredTenants === option.value
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                    }`}
                >
                  <div className="font-semibold text-heading mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted">{option.desc}</div>
                </motion.button>
              ))}
            </div>

            {errors.preferredTenants && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.preferredTenants}
                </p>
              </motion.div>
            )}

            {/* Change Indicator */}
            {originalProperty?.preferredTenants !==
              formData.preferredTenants && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <FiEdit3
                      className="text-yellow-600 mt-0.5 flex-shrink-0"
                      size={14}
                    />
                    <div className="text-sm text-yellow-800">
                      <span className="font-medium">Preference changed from </span>
                      <span className="line-through">
                        {originalProperty?.preferredTenants || "Not set"}
                      </span>
                      <span className="mx-2">to</span>
                      <span className="font-bold">
                        {formData.preferredTenants}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
          </motion.div>

          {/* Availability / Move-in Period */}
          <motion.div variants={itemVariants} className="space-y-4 pt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <FiCalendar className="text-white" size={18} />
              </div>
              <label className="text-xl font-bold text-heading">
                Move-in Period <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "Immediate",
                "Within 15 days",
                "Within 1 month",
                "After 1 month",
              ].map((period, index) => (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleInputChange("availableFrom", period)}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.availableFrom === period
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-lg"
                    }`}
                >
                  <div className="font-semibold text-heading text-sm">
                    {period}
                  </div>
                </motion.button>
              ))}
            </div>

            {errors.availableFrom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.availableFrom}
                </p>
              </motion.div>
            )}

            {/* Change Indicator */}
            {originalProperty?.availableFrom !== formData.availableFrom && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <FiEdit3
                    className="text-yellow-600 mt-0.5 flex-shrink-0"
                    size={14}
                  />
                  <div className="text-sm text-yellow-800">
                    <span className="font-medium">Move-in period changed: </span>
                    <span className="line-through">
                      {originalProperty?.availableFrom || "Not set"}
                    </span>
                    <span className="mx-2">to</span>
                    <span className="font-bold">{formData.availableFrom}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}

      {/* Maintenance Cost - For Residential/Rent or Commercial */}
      {(formData.category === "Residential" &&
        formData.propertyType === "rent") ||
        formData.category === "Commercial" ? (
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <FiDollarSign className="text-white" size={18} />
            </div>
            <label className="text-xl font-bold text-heading">
              Maintenance Cost (Optional)
            </label>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={formData.maintenance || ""}
              onChange={(e) => handleInputChange("maintenance", e.target.value)}
              placeholder="e.g., ₹2,500/month, ₹10,000/year"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
            <p className="text-sm text-muted">
              Include maintenance charges, society fees, or any recurring costs
            </p>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}