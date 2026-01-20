"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { FiHeart, FiMapPin, FiStar, FiPlus, FiX } from "react-icons/fi";

// Helper function to normalize nearby place types
const normalizeNearbyPlaceType = (type) => {
  if (!type) return "";
  const normalized = String(type).toLowerCase().trim();

  // Handle common variations and mappings
  const typeMappings = {
    "shopping mall": "mall",
    "shopping-mall": "mall",
    "metro station": "metro",
    "metro-station": "metro",
    "bus stop": "bus-stop",
    "bus-stop": "bus-stop",
    supermarket: "supermarket",
    grocery: "supermarket",
    "bank/atm": "bank",
    atm: "bank",
  };

  return typeMappings[normalized] || normalized;
};

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

// Validation function for nearby places
const validateNearbyPlaces = (places) => {
  if (!places || places.length === 0) return null;

  for (const place of places) {
    if (place.distance && !/^\d+(\.\d+)?(m|km)$/.test(place.distance)) {
      return "Invalid distance format. Use format like 100m, 1.5km, 2km";
    }
    if (place.rating && (place.rating < 1 || place.rating > 5)) {
      return "Rating must be between 1 and 5";
    }
  }
  return null;
};

export default function StepAmenities({
  formData,
  updateFormData,
  errors,
  setErrors,
  originalProperty,
  isEditing = false,
}) {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await fetch("/api/amenities");
        if (res.ok) {
          const data = await res.json();
          setAmenities(
            data.amenities.map((item) => ({
              id: item._id,
              name: item.title,
              createdAt: item.createdAt,
            }))
          );
        } else {
          console.error("Failed to fetch amenities");
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };
    fetchAmenities();
  }, []);

  // Ensure societyAmenities contains only string IDs
  useEffect(() => {
    if (formData.societyAmenities && formData.societyAmenities.length > 0) {
      const cleanedAmenities = formData.societyAmenities
        .map((amenity) => (typeof amenity === "string" ? amenity : amenity._id))
        .filter((id) => id); // Remove any falsy values

      if (
        cleanedAmenities.length !== formData.societyAmenities.length ||
        !cleanedAmenities.every((id) => typeof id === "string")
      ) {
        updateFormData({ societyAmenities: cleanedAmenities });
      }
    }
  }, [formData.societyAmenities, updateFormData]);

  // Pre-populate form data from original property
  useEffect(() => {
    if (originalProperty && isEditing) {
      // Pre-populate highlights
      if (originalProperty.highlights && !formData.highlights) {
        updateFormData({ highlights: originalProperty.highlights });
      }

      // Pre-populate society amenities - check both new and old data structures
      if (!formData.societyAmenities) {
        let societyAmenityIds = [];

        // First try the new structure (array of IDs)
        if (originalProperty.societyAmenities && Array.isArray(originalProperty.societyAmenities)) {
          societyAmenityIds = originalProperty.societyAmenities;
        }
        // Fallback to old structure (objects in amenities.society)
        else if (originalProperty.amenities?.society && Array.isArray(originalProperty.amenities.society)) {
          societyAmenityIds = originalProperty.amenities.society.map(
            (amenity) => (typeof amenity === "string" ? amenity : amenity._id)
          ).filter(Boolean);
        }

        if (societyAmenityIds.length > 0) {
          updateFormData({ societyAmenities: societyAmenityIds });
        }
      }
    }
  }, [originalProperty, isEditing, formData.highlights, formData.societyAmenities, updateFormData]);

  // Validate nearby places on formData change
  useEffect(() => {
    const validationError = validateNearbyPlaces(formData.nearbyPlaces);
    setErrors((prev) => ({ ...prev, nearbyPlaces: validationError }));
  }, [formData.nearbyPlaces, setErrors]);

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
    // Extract ID if it's an object
    const id =
      typeof amenityId === "object" && amenityId !== null
        ? amenityId._id || amenityId
        : amenityId;

    // Check if selected, handling both objects and strings
    const isSelected = currentAmenities.some(
      (amenity) =>
        (typeof amenity === "object" ? amenity._id || amenity : amenity) === id
    );

    let newAmenities;
    if (isSelected) {
      newAmenities = currentAmenities.filter(
        (amenity) =>
          (typeof amenity === "object" ? amenity._id || amenity : amenity) !==
          id
      );
    } else {
      newAmenities = [...currentAmenities, id]; // Always store as ID
    }

    console.log(
      "Toggling amenity:",
      amenityId,
      "ID:",
      id,
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

    // Validate and set errors
    const validationError = validateNearbyPlaces(updatedPlaces);
    setErrors((prev) => ({ ...prev, nearbyPlaces: validationError }));
  };

  // Add new nearby place
  const addNearbyPlace = () => {
    const nearbyPlaces = formData.nearbyPlaces || [];
    updateFormData({
      nearbyPlaces: [
        { type: "", name: "", distance: "", rating: 4.0 },
        ...nearbyPlaces,
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
      <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-2">
          Amenities & Highlights
        </h1>
        <p className="text-muted text-base sm:text-lg">
          Highlight your property&apos;s best features and nearby attractions
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

        {/* Error Display for Society Amenities */}
        {errors.societyAmenities && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">
              {errors.societyAmenities}
            </p>
          </motion.div>
        )}

        {/* Selected Amenities Tags */}
        {formData.societyAmenities && formData.societyAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.societyAmenities.map((amenityId) => {
              // Handle both string IDs and full amenity objects
              const isObject =
                typeof amenityId === "object" && amenityId !== null;

              let amenityData;
              let displayName = "Unknown Amenity";
              let keyValue;

              if (isObject) {
                amenityData = amenityId;
                displayName = amenityData?.name || amenityData?.title || "Unknown Amenity";
                keyValue = amenityData._id || amenityData.title;
              } else {
                // First try to find in global amenities list
                amenityData = amenities.find((a) => a.id === amenityId);

                // If not found in global list, try to find in original property amenities
                if (!amenityData && originalProperty?.amenities?.society) {
                  amenityData = originalProperty.amenities.society.find(
                    (a) => (a._id && a._id.toString() === amenityId) || a._id === amenityId
                  );
                }

                displayName = amenityData?.name || amenityData?.title || "Unknown Amenity";
                keyValue = amenityId;
              }

              return (
                <motion.div
                  key={String(keyValue)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{displayName}</span>
                  <button
                    onClick={() =>
                      handleAmenityToggle(
                        isObject ? amenityId._id || amenityId : amenityId
                      )
                    }
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
          availableAmenities={amenities}
          selectedAmenities={formData.societyAmenities || []}
          onAmenityToggle={handleAmenityToggle}
        />

        {/* Suggested Amenities */}
        <SuggestedAmenities
          allAmenities={amenities}
          selectedAmenities={formData.societyAmenities || []}
          onAmenityToggle={handleAmenityToggle}
          propertyCategory={formData.category}
        />
      </motion.div>

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
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all min-h-[44px] sm:min-h-auto"
          >
            <FiPlus size={16} />
            <span className="text-sm sm:text-base">Add Place</span>
          </motion.button>
        </div>

        {/* Error Display for Nearby Places */}
        {errors.nearbyPlaces && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">
              {errors.nearbyPlaces}
            </p>
          </motion.div>
        )}

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
                  Place #{(formData.nearbyPlaces || []).length - index}
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
                      (place.type || place.category)
                        ? nearbyPlaceTypes.find(
                            (opt) =>
                              opt.value.toLowerCase() ===
                              String(place.type || place.category).toLowerCase()
                          )
                        : null
                    }
                    onFocus={() => {}}
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
                        minHeight: "44px",
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
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        fontSize: "0.875rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "0.875rem",
                        minHeight: "44px",
                        display: "flex",
                        alignItems: "center",
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
                      indicatorsContainer: (base) => ({
                        ...base,
                        padding: "0.25rem",
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-auto"
                  />
                </div>

                {/* Distance */}
                <div>
                  <label className="text-sm font-medium text-heading mb-2 block">
                    Distance
                  </label>
                  <input
                    type="text"
                    value={place.distance || ""}
                    onChange={(e) =>
                      handleNearbyPlaceChange(index, "distance", e.target.value)
                    }
                    placeholder="e.g., 100m, 1.5km, 2km"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-auto"
                  />
                  <div className="text-xs text-muted mt-1">
                    Enter distance (e.g., 100m, 1.5km, 2km)
                  </div>
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
                      onChange={(e) => {
                        const rawValue = parseFloat(e.target.value);
                        const clampedValue =
                          rawValue > 5 ? 5 : rawValue < 1 ? 1 : rawValue;
                        handleNearbyPlaceChange(
                          index,
                          "rating",
                          clampedValue || ""
                        );
                      }}
                      placeholder="4.0"
                      min="1"
                      max="5"
                      step="0.1"
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-auto"
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

        {/* Error Display for Key Highlights */}
        {errors.highlights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">
              {errors.highlights}
            </p>
          </motion.div>
        )}

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
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 sm:p-4"
          >
            <h4 className="font-semibold text-purple-800 mb-2 sm:mb-3 text-sm sm:text-base">
              Suggested Highlights
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-2">
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
                    className="px-3 sm:px-3 py-2 sm:py-1 bg-white border border-purple-300 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
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
        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-auto"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredAmenities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-60 overflow-y-auto"
        >
          {filteredAmenities.map((amenity) => (
            <button
              key={amenity.id}
              onClick={() => handleAmenityClick(amenity.id)}
              className="w-full text-left px-3 sm:px-4 py-3 sm:py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors min-h-[44px] sm:min-h-auto flex items-center"
            >
              <span className="text-sm font-medium text-gray-900">
                {amenity.name}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* No results message */}
      {showSuggestions && searchTerm && filteredAmenities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 sm:p-4 text-center"
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
  // Get suggested amenities - latest 6 not selected
  const suggestedAmenities = useMemo(() => {
    return allAmenities
      .filter((amenity) => !selectedAmenities.includes(amenity.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map((amenity) => amenity.id);
  }, [allAmenities, selectedAmenities]);

  if (suggestedAmenities.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4"
    >
      <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">
        Suggested Amenities
      </h4>
      <div className="flex flex-wrap gap-2 sm:gap-2">
        {suggestedAmenities.map((amenityId) => {
          const amenity = allAmenities.find((a) => a.id === amenityId);
          return (
            <motion.button
              key={amenityId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAmenityToggle(amenityId)}
              className="px-3 sm:px-3 py-2 sm:py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 sm:gap-2"
    >
      <input
        type="text"
        value={newHighlight}
        onChange={(e) => setNewHighlight(e.target.value)}
        placeholder="Enter a key highlight (e.g., Prime Location, Modern Amenities)"
        className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] sm:min-h-auto"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!newHighlight.trim()}
        className="px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-auto text-sm sm:text-base"
      >
        Add
      </motion.button>
    </form>
  );
}