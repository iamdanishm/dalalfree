"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import {
  FiHeart,
  FiMapPin,
  FiStar,
  FiPlus,
  FiX,
  FiCheck,
} from "react-icons/fi";
import {
  FaSwimmingPool,
  FaDumbbell,
  FaShieldAlt,
  FaParking,
  FaElevator,
  FaTree,
  FaWifi,
  FaFire,
  FaCamera,
  FaConciergeBell,
} from "react-icons/fa";

const societyAmenities = [
  // Safety & Security
  { id: "24-7-security", name: "24/7 Security", category: "safety" },
  { id: "cctv", name: "CCTV Surveillance", category: "safety" },
  { id: "intercom", name: "Intercom", category: "safety" },
  { id: "fire-safety", name: "Fire Safety", category: "safety" },
  { id: "gated-community", name: "Gated Community", category: "safety" },

  // Convenience & Utilities
  { id: "power-backup", name: "Power Backup", category: "utilities" },
  { id: "water-supply", name: "24/7 Water Supply", category: "utilities" },
  { id: "lift", name: "Lift/Elevator", category: "convenience" },
  { id: "parking", name: "Parking Space", category: "convenience" },
  { id: "waste-management", name: "Waste Management", category: "utilities" },

  // Recreational & Lifestyle
  { id: "swimming-pool", name: "Swimming Pool", category: "recreational" },
  { id: "gym", name: "Gym/Fitness Center", category: "fitness" },
  {
    id: "children-play-area",
    name: "Children's Play Area",
    category: "family",
  },
  { id: "garden", name: "Garden/Landscaped Area", category: "recreational" },
  { id: "club-house", name: "Club House", category: "recreational" },
  { id: "jogging-track", name: "Jogging Track", category: "fitness" },

  // Additional Amenities
  { id: "visitor-parking", name: "Visitor Parking", category: "convenience" },
  { id: "maintenance-staff", name: "Maintenance Staff", category: "services" },
  { id: "laundry", name: "Laundry Service", category: "services" },
  { id: "housekeeping", name: "Housekeeping", category: "services" },
  { id: "wifi", name: "Wi-Fi Connectivity", category: "technology" },
  { id: "ro-water", name: "RO Water System", category: "utilities" },
  { id: "solar-panels", name: "Solar Panels", category: "eco" },
  {
    id: "rain-water-harvesting",
    name: "Rain Water Harvesting",
    category: "eco",
  },
  {
    id: "senior-citizen-area",
    name: "Senior Citizen Area",
    category: "family",
  },
  { id: "meditation-area", name: "Meditation/Yoga Area", category: "wellness" },
];

const nearbyPlaceTypes = [
  { value: "school", label: "School", icon: "🎓" },
  { value: "hospital", label: "Hospital", icon: "🏥" },
  { value: "mall", label: "Shopping Mall", icon: "🛍️" },
  { value: "metro", label: "Metro Station", icon: "🚇" },
  { value: "bus-stop", label: "Bus Stop", icon: "🚌" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "park", label: "Park", icon: "🌳" },
  { value: "bank", label: "Bank/ATM", icon: "🏦" },
  { value: "supermarket", label: "Supermarket", icon: "🏪" },
];

const distanceOptions = [
  { value: "0.1", label: "Within 100m" },
  { value: "0.2", label: "Within 200m" },
  { value: "0.5", label: "Within 500m" },
  { value: "1", label: "Within 1 km" },
  { value: "2", label: "Within 2 km" },
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
];

export default function StepAmenities({
  formData,
  updateFormData,
  errors,
  setErrors,
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

  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = formData.societyAmenities || [];
    const isSelected = currentAmenities.includes(amenityId);

    const newAmenities = isSelected
      ? currentAmenities.filter((id) => id !== amenityId)
      : [...currentAmenities, amenityId];

    console.log(
      "Toggling amenity:",
      amenityId,
      "Current:",
      currentAmenities,
      "New:",
      newAmenities
    );
    updateFormData({ societyAmenities: newAmenities });
  };

  // Handle nearby place changes
  const handleNearbyPlaceChange = (index, field, value) => {
    const nearbyPlaces = formData.nearbyPlaces || [];
    const updatedPlaces = [...nearbyPlaces];
    updatedPlaces[index] = { ...updatedPlaces[index], [field]: value };
    updateFormData({ nearbyPlaces: updatedPlaces });
  };

  // Add new nearby place
  const addNearbyPlace = () => {
    const nearbyPlaces = formData.nearbyPlaces || [];
    updateFormData({
      nearbyPlaces: [
        ...nearbyPlaces,
        { type: "", name: "", distance: "", rating: 4.0 },
      ],
    });
  };

  // Remove nearby place
  const removeNearbyPlace = (index) => {
    const nearbyPlaces = formData.nearbyPlaces || [];
    const updatedPlaces = nearbyPlaces.filter((_, i) => i !== index);
    updateFormData({ nearbyPlaces: updatedPlaces });
  };

  // Handle highlights
  const handleHighlightAdd = (highlight) => {
    const highlights = formData.highlights || [];
    if (highlight.trim() && !highlights.includes(highlight.trim())) {
      updateFormData({ highlights: [...highlights, highlight.trim()] });
    }
  };

  const handleHighlightRemove = (highlightToRemove) => {
    const highlights = formData.highlights || [];
    updateFormData({
      highlights: highlights.filter((h) => h !== highlightToRemove),
    });
  };

  // Suggested highlights based on category and selected amenities
  const suggestedHighlights = useMemo(() => {
    const suggestions = [];

    if (formData.category === "Residential") {
      suggestions.push(
        "Prime Location",
        "Vastu Compliant",
        "Family Friendly",
        "Modern Amenities"
      );
    }

    if (formData.category === "Commercial") {
      suggestions.push(
        "High Footfall Area",
        "Business Hub",
        "Modern Infrastructure",
        "Investment Opportunity"
      );
    }

    // Add suggestions based on selected amenities
    const selectedAmenities = formData.societyAmenities || [];
    if (selectedAmenities.includes("swimming-pool")) {
      suggestions.push("Swimming Pool Available");
    }
    if (selectedAmenities.includes("gym")) {
      suggestions.push("Fitness Center");
    }
    if (selectedAmenities.includes("24-7-security")) {
      suggestions.push("24/7 Security");
    }

    return suggestions;
  }, [formData.category, formData.societyAmenities]);

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
          Amenities & Highlights
        </h1>
        <p className="text-muted text-lg">
          Highlight your property's best features and nearby attractions
        </p>
      </motion.div>

      {/* Society Amenities */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <FiHeart className="text-white" size={18} />
          </div>
          <div>
            <label className="text-xl font-bold text-heading">
              Society Amenities
            </label>
            <p className="text-sm text-muted">
              Select all amenities available in your society
            </p>
          </div>
        </div>

        {/* Selected Amenities Tags */}
        {formData.societyAmenities && formData.societyAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.societyAmenities.map((amenityId) => {
              const amenity = societyAmenities.find((a) => a.id === amenityId);
              return (
                <motion.div
                  key={amenityId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{amenity?.name}</span>
                  <button
                    onClick={() => handleAmenityToggle(amenityId)}
                    className="text-primary hover:text-primary/70"
                  >
                    <FiX size={12} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Amenities Multi-Select Input */}
        <AmenitySelector
          availableAmenities={societyAmenities}
          selectedAmenities={formData.societyAmenities || []}
          onAmenityToggle={handleAmenityToggle}
        />

        {/* Suggested Amenities */}
        <SuggestedAmenities
          allAmenities={societyAmenities}
          selectedAmenities={formData.societyAmenities || []}
          onAmenityToggle={handleAmenityToggle}
          propertyCategory={formData.category}
        />
      </motion.div>

      {/* Spacer */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* Nearby Places */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <FiMapPin className="text-white" size={18} />
            </div>
            <div>
              <label className="text-xl font-bold text-heading">
                Nearby Places
              </label>
              <p className="text-sm text-muted">
                Add important locations near your property
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addNearbyPlace}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
          >
            <FiPlus size={16} />
            <span>Add Place</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {(formData.nearbyPlaces || []).map((place, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-semibold text-heading">
                  Place #{index + 1}
                </h4>
                <button
                  onClick={() => removeNearbyPlace(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Place Type */}
                <div>
                  <label className="text-sm font-medium text-heading mb-2 block">
                    Type
                  </label>
                  <Select
                    value={
                      place.type
                        ? nearbyPlaceTypes.find(
                            (opt) => opt.value === place.type
                          )
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleNearbyPlaceChange(
                        index,
                        "type",
                        selectedOption?.value || ""
                      )
                    }
                    options={nearbyPlaceTypes}
                    placeholder="Select type"
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
                          backgroundColor: state.isSelected
                            ? "#e90914"
                            : "#fef2f2",
                          color: state.isSelected ? "white" : "#111827",
                        },
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "#d10711"
                            : "#fecaca",
                        },
                      }),
                    }}
                  />
                </div>

                {/* Place Name */}
                <div>
                  <label className="text-sm font-medium text-heading mb-2 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={place.name || ""}
                    onChange={(e) =>
                      handleNearbyPlaceChange(index, "name", e.target.value)
                    }
                    placeholder="Place name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="text-sm font-medium text-heading mb-2 block">
                    Distance
                  </label>
                  <Select
                    value={
                      place.distance
                        ? distanceOptions.find(
                            (opt) => opt.value === place.distance
                          )
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleNearbyPlaceChange(
                        index,
                        "distance",
                        selectedOption?.value || ""
                      )
                    }
                    options={distanceOptions}
                    placeholder="Select distance"
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
                          backgroundColor: state.isSelected
                            ? "#e90914"
                            : "#fef2f2",
                          color: state.isSelected ? "white" : "#111827",
                        },
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "#d10711"
                            : "#fecaca",
                        },
                      }),
                    }}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium text-heading mb-2 block">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={place.rating || ""}
                      onChange={(e) =>
                        handleNearbyPlaceChange(
                          index,
                          "rating",
                          parseFloat(e.target.value) || ""
                        )
                      }
                      placeholder="4.0"
                      min="1"
                      max="5"
                      step="0.1"
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center space-x-1">
                      <FiStar
                        className="text-yellow-400 fill-current"
                        size={14}
                      />
                      <span className="text-sm text-muted">/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Highlights */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <FiStar className="text-white" size={18} />
          </div>
          <div>
            <label className="text-xl font-bold text-heading">
              Key Highlights
            </label>
            <p className="text-sm text-muted">
              Add selling points and unique features
            </p>
          </div>
        </div>

        {/* Current Highlights */}
        {formData.highlights && formData.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                <span>{highlight}</span>
                <button
                  onClick={() => handleHighlightRemove(highlight)}
                  className="text-primary hover:text-primary/70"
                >
                  <FiX size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add New Highlight */}
        <HighlightInput onAdd={handleHighlightAdd} />

        {/* Suggested Highlights */}
        {suggestedHighlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4"
          >
            <h4 className="font-semibold text-purple-800 mb-3">
              Suggested Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestedHighlights
                .filter(
                  (highlight) => !formData.highlights?.includes(highlight)
                )
                .map((highlight, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleHighlightAdd(highlight)}
                    className="px-3 py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                  >
                    + {highlight}
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Amenity Selector Component
function AmenitySelector({
  availableAmenities,
  selectedAmenities,
  onAmenityToggle,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  // Filter amenities based on search term
  const filteredAmenities = availableAmenities.filter(
    (amenity) =>
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedAmenities.includes(amenity.id)
  );

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleContainerBlur = (e) => {
    // Only hide if focus is moving outside the container
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setShowSuggestions(false);
    }
  };

  const handleAmenityClick = (amenityId) => {
    onAmenityToggle(amenityId);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleContainerBlur}
        placeholder="Search and select amenities..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredAmenities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {filteredAmenities.map((amenity) => (
            <button
              key={amenity.id}
              onClick={() => handleAmenityClick(amenity.id)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {amenity.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {amenity.category}
                </span>
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {/* No results message */}
      {showSuggestions && searchTerm && filteredAmenities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center"
        >
          <p className="text-sm text-gray-500">
            No amenities found matching &ldquo;{searchTerm}&rdquo;
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Suggested Amenities Component
function SuggestedAmenities({
  allAmenities,
  selectedAmenities,
  onAmenityToggle,
  propertyCategory,
}) {
  // Get suggested amenities based on category and common selections
  const suggestedAmenities = useMemo(() => {
    const suggestions = [];

    // Category-based suggestions
    if (propertyCategory === "Residential") {
      // Essential residential amenities
      suggestions.push(
        "24-7-security",
        "lift",
        "parking",
        "power-backup",
        "water-supply",
        "children-play-area",
        "gym"
      );
    } else if (propertyCategory === "Commercial") {
      // Essential commercial amenities
      suggestions.push(
        "lift",
        "parking",
        "power-backup",
        "24-7-security",
        "wifi",
        "maintenance-staff"
      );
    }

    // Always suggest popular amenities if not selected
    const popularAmenities = [
      "swimming-pool",
      "cctv",
      "gated-community",
      "garden",
    ];

    popularAmenities.forEach((amenityId) => {
      if (
        !suggestions.includes(amenityId) &&
        !selectedAmenities.includes(amenityId)
      ) {
        suggestions.push(amenityId);
      }
    });

    // Return only amenities that exist and aren't selected
    return suggestions
      .filter((amenityId) => allAmenities.find((a) => a.id === amenityId))
      .filter((amenityId) => !selectedAmenities.includes(amenityId))
      .slice(0, 8); // Limit to 8 suggestions
  }, [allAmenities, selectedAmenities, propertyCategory]);

  if (suggestedAmenities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
    >
      <h4 className="font-semibold text-blue-800 mb-3">Suggested Amenities</h4>
      <div className="flex flex-wrap gap-2">
        {suggestedAmenities.map((amenityId) => {
          const amenity = allAmenities.find((a) => a.id === amenityId);
          return (
            <motion.button
              key={amenityId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAmenityToggle(amenityId)}
              className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
            >
              + {amenity?.name}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Highlight Input Component
function HighlightInput({ onAdd }) {
  const [newHighlight, setNewHighlight] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newHighlight.trim()) {
      onAdd(newHighlight.trim());
      setNewHighlight("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={newHighlight}
        onChange={(e) => setNewHighlight(e.target.value)}
        placeholder="Enter a key highlight (e.g., Prime Location, Modern Amenities)"
        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!newHighlight.trim()}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </motion.button>
    </form>
  );
}
