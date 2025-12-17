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

export default function StepSpecifications({
  formData,
  updateFormData,
  errors,
  setErrors,
}) {
  // Animation variants matching project theme
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

  // Handle input changes with validation clearing
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });

    // Clear related errors
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
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
      floor: "5th",
      totalFloors: 12,

      // Property age
      age: 3,
      ageUnit: "years old",

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
    if (area >= 100000) {
      return `${(area / 100000).toFixed(2)} acres`;
    } else if (area >= 1000) {
      return `${(area / 1000).toFixed(2)} sq.yd`;
    } else {
      return `${area} sq.ft`;
    }
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
            Tell us about the detailed specifications of your{" "}
            {formData.category?.toLowerCase()} property
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
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    formData.bhk === option.value
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
                        label: `${formData.bathrooms} Bathroom${
                          formData.bathrooms > 1 ? "s" : ""
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
                  formData.balcony !== undefined && formData.balcony !== null
                    ? {
                        value: formData.balcony,
                        label:
                          formData.balcony === 0
                            ? "No Balcony"
                            : formData.balcony === 1
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
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    formData.furnishing === option.value
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

      {/* Area Section - Built-up & Carpet Area */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <FiHome className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Area Details (in sq.ft)
          </label>
        </div>

        {/* Area Fields Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Built-up Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Built-up Area *
            </label>
            <input
              type="number"
              value={formData.builtUpArea || ""}
              onChange={(e) =>
                handleInputChange(
                  "builtUpArea",
                  parseFloat(e.target.value) || ""
                )
              }
              placeholder="Total built-up area"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              min="1"
            />
            {formData.builtUpArea && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-block"
              >
                {formatArea(formData.builtUpArea)}
              </motion.div>
            )}
          </div>

          {/* Carpet Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-heading flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Carpet Area <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.carpetArea || ""}
              onChange={(e) =>
                handleInputChange(
                  "carpetArea",
                  parseFloat(e.target.value) || ""
                )
              }
              placeholder="Usable carpet area"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              min="1"
            />
            {formData.carpetArea && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block"
              >
                {formatArea(formData.carpetArea)}
              </motion.div>
            )}
          </div>
        </div>

        {/* Area Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-xs">ℹ️</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Area Information
              </h4>
              <p className="text-sm text-blue-700">
                <strong>Built-up Area:</strong> Total area including walls and
                balconies
                <br />
                <strong>Carpet Area:</strong> Actual usable area inside the
                property
              </p>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {(errors.area || errors.builtUpArea || errors.carpetArea) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">
              {errors.area || errors.builtUpArea || errors.carpetArea}
            </p>
          </motion.div>
        )}

        {/* Common Sizes Suggestions - For Built-up Area */}
        {getAreaSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">💡</span>
              </div>
              <label className="text-sm font-semibold text-heading">
                Common built-up sizes for {formData.category?.toLowerCase()}{" "}
                properties:
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAreaSuggestions.map((area, index) => (
                <motion.button
                  key={area}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleInputChange("builtUpArea", area)}
                  className="px-4 py-2 text-sm bg-white hover:bg-primary hover:text-white rounded-lg transition-all duration-200 shadow-sm border border-gray-200 hover:border-primary font-medium"
                >
                  {formatArea(area)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Floor, Age, and Parking - Single Row */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
            <FiHome className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Additional Details
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Floor and Total Floors */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="text-sm font-medium text-heading flex items-center">
              <FiHome className="mr-2" size={14} />
              Floor <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.floor || ""}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                  placeholder="e.g., Ground, 1st, 2nd"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
                <div className="text-xs text-muted mt-1">Specific floor</div>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.totalFloors || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "totalFloors",
                      parseInt(e.target.value) || ""
                    )
                  }
                  placeholder="Total floors"
                  min="1"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
                <div className="text-xs text-muted mt-1">
                  Building floors <span className="text-red-500">*</span>
                </div>
              </div>
            </div>
            {(formData.floor || formData.totalFloors) && (
              <div className="text-sm text-primary font-medium bg-primary/5 px-3 py-1 rounded-full inline-block">
                {formData.floor && formData.totalFloors
                  ? `${formData.floor} of ${formData.totalFloors}`
                  : formData.floor || `${formData.totalFloors} floors`}
              </div>
            )}

            {(errors.floor || errors.totalFloors) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.floor || errors.totalFloors}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Age */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="text-sm font-medium text-heading flex items-center">
              <FiCalendar className="mr-2" size={14} />
              Property Age <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  handleInputChange("age", parseInt(e.target.value) || "")
                }
                placeholder={
                  formData.ageUnit === "months old" ? "Months" : "Years"
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                min="0"
                max="100"
              />
              <Select
                value={
                  formData.ageUnit
                    ? {
                        value: formData.ageUnit,
                        label:
                          formData.ageUnit === "years old" ? "Years" : "Months",
                      }
                    : { value: "years old", label: "Years" }
                }
                onChange={(selectedOption) =>
                  handleInputChange(
                    "ageUnit",
                    selectedOption?.value || "years old"
                  )
                }
                options={[
                  { value: "years old", label: "Years" },
                  { value: "months old", label: "Months" },
                ]}
                className="text-sm min-w-[80px]"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    padding: "0.125rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    minHeight: "48px",
                    "&:hover": { borderColor: "#e90914" },
                    "&:focus-within": {
                      borderColor: "#e90914",
                      boxShadow: "0 0 0 1px #e90914",
                    },
                  }),
                  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                  singleValue: (base) => ({
                    ...base,
                    color: "#111827",
                    fontWeight: "500",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: "0.25rem 0.5rem",
                  }),
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
            </div>
            {formData.age && (
              <div className="text-xs text-muted">
                {formData.age}{" "}
                {formData.ageUnit === "years old" ? "years" : "months"} old
              </div>
            )}

            {errors.age && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">{errors.age}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Parking */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="text-sm font-medium text-heading flex items-center">
              <FiTruck className="mr-2" size={14} />
              Parking <span className="text-red-500">*</span>
            </label>
            <Select
              value={
                formData.parking
                  ? { value: formData.parking, label: formData.parking }
                  : null
              }
              onChange={(selectedOption) =>
                handleInputChange("parking", selectedOption?.value || "")
              }
              options={parkingOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Select parking"
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
                  minHeight: "48px",
                  "&:hover": { borderColor: "#e90914" },
                  "&:focus-within": {
                    borderColor: "#e90914",
                    boxShadow: "0 0 0 1px #e90914",
                  },
                }),
                placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                singleValue: (base) => ({
                  ...base,
                  color: "#111827",
                  fontWeight: "500",
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: "0.25rem 0.5rem",
                }),
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
          </motion.div>
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
              className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                formData.facing === option.value
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
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                formData.possessionStatus === option.value
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

      {/* Maintenance Cost - For Residential/Rent or Commercial */}
      {(formData.category === "Residential" &&
        formData.propertyType === "rent") ||
      formData.category === "Commercial" ? (
        <motion.div variants={itemVariants} className="space-y-4">
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

      {/* Specification Summary */}
      {formData.category === "Residential" && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <h4 className="text-lg font-bold text-heading">Property Summary</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                BHK
              </div>
              <div className="text-xl font-bold text-primary">
                {formData.bhk || "—"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Built-up Area
              </div>
              <div className="text-lg font-bold text-green-600">
                {formData.builtUpArea ? formatArea(formData.builtUpArea) : "—"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Carpet Area
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formData.carpetArea ? formatArea(formData.carpetArea) : "—"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Bathrooms
              </div>
              <div className="text-xl font-bold text-cyan-600">
                {formData.bathrooms || "—"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Furnishing
              </div>
              <div className="text-sm font-bold text-purple-600 capitalize">
                {formData.furnishing
                  ? formData.furnishing.replace("-", " ")
                  : "—"}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Balcony
              </div>
              <div className="text-xl font-bold text-orange-600">
                {formData.balcony ? `${formData.balcony}` : "—"}
              </div>
            </div>
          </div>

          {/* Additional Details Cards */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Floor
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {formData.floor && formData.totalFloors
                  ? `${formData.floor} of ${formData.totalFloors}`
                  : formData.floor || "—"}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Age
              </div>
              <div className="text-sm font-semibold text-amber-700">
                {formData.age
                  ? `${formData.age} ${
                      formData.ageUnit === "years old" ? "years" : "months"
                    }`
                  : "—"}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                Facing
              </div>
              <div className="text-sm font-semibold text-rose-700 capitalize">
                {formData.facing ? formData.facing.replace("-", " ") : "—"}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
