import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import {
  FiTag,
  FiMapPin,
  FiFileText,
  FiCheck,
  FiLoader,
  FiNavigation,
} from "react-icons/fi";

const priceSuggestions = {
  Residential: {
    sell: [
      { label: "Under ₹30 Lakhs", min: 0, max: 3000000 },
      { label: "₹30-60 Lakhs", min: 3000000, max: 6000000 },
      { label: "₹60-1 Crore", min: 6000000, max: 10000000 },
      { label: "₹1-2 Crores", min: 10000000, max: 20000000 },
      { label: "Over ₹2 Crores", min: 20000000, max: 999999999 },
    ],
    rent: [
      { label: "Under ₹10,000/month", min: 0, max: 10000 },
      { label: "₹10,000-25,000/month", min: 10000, max: 25000 },
      { label: "₹25,000-50,000/month", min: 25000, max: 50000 },
      { label: "₹50,000-1,00,000/month", min: 50000, max: 100000 },
      { label: "Over ₹1,00,000/month", min: 100000, max: 999999999 },
    ],
  },
  Commercial: {
    sell: [
      { label: "Under ₹50 Lakhs", min: 0, max: 5000000 },
      { label: "₹50-1.5 Crores", min: 5000000, max: 15000000 },
      { label: "₹1.5-5 Crores", min: 15000000, max: 50000000 },
      { label: "₹5-15 Crores", min: 50000000, max: 150000000 },
      { label: "Over ₹15 Crores", min: 150000000, max: 999999999 },
    ],
    rent: [
      { label: "Under ₹25,000/month", min: 0, max: 25000 },
      { label: "₹25,000-50,000/month", min: 25000, max: 50000 },
      { label: "₹50,000-1,00,000/month", min: 50000, max: 100000 },
      { label: "₹1-5 Lakhs/month", min: 100000, max: 500000 },
      { label: "Over ₹5 Lakhs/month", min: 500000, max: 999999999 },
    ],
  },
  Land: {
    sell: [
      { label: "Under ₹10 Lakhs", min: 0, max: 1000000 },
      { label: "₹10-50 Lakhs", min: 1000000, max: 5000000 },
      { label: "₹50-2 Crores", min: 5000000, max: 20000000 },
      { label: "₹2-10 Crores", min: 20000000, max: 100000000 },
      { label: "Over ₹10 Crores", min: 100000000, max: 999999999 },
    ],
  },
};

// Generate suggested titles based on property type and category
const generateTitleSuggestions = (category, city = "", propertyType = "") => {
  const baseTitles = {
    Residential: {
      sell: [
        `Beautiful ${category} in ${city} - Ready to Move`,
        `Luxury ${category} with Modern Amenities in ${city}`,
        `Spacious ${category} for Sale in ${city} - Prime Location`,
        `${category} with Garden View in ${city}`,
        `Newly Built ${category} in ${city} - Under Construction`,
      ],
      rent: [
        `Furnished ${category} Available for Rent in ${city}`,
        `Spacious ${category} on Rent in ${city} - Family Friendly`,
        `${category} for Rent with All Amenities in ${city}`,
        `Luxury ${category} Rental in ${city} - Semi Furnished`,
        `Budget ${category} on Rent in ${city} - Near Metro`,
      ],
    },
    Commercial: {
      sell: [
        `${category} Space for Sale in ${city} - Prime Business Location`,
        `Commercial Property Available for Sale in ${city}`,
        `Investment Opportunity in ${city} - ${category} Space`,
        `Business Premises for Sale in ${city} - High Visibility`,
        `Commercial Real Estate in ${city} - Ready for Business`,
      ],
      rent: [
        `${category} on Rent in ${city} - High Footfall Area`,
        `Commercial Space Available for Lease in ${city}`,
        `Business Premises for Rent in ${city} - Prime Location`,
        `Office/Shop Space on Rent in ${city}`,
        `Commercial Property Rental in ${city} - Immediate Occupancy`,
      ],
    },
    Land: {
      sell: [
        `Prime Land for Sale in ${city} - Investment Opportunity`,
        `Development Land Available in ${city}`,
        `Plot for Sale in ${city} - Ready for Construction`,
        `Investment Property in ${city} - Land Parcel`,
        `Agricultural/Residential Land in ${city}`,
      ],
    },
  };

  if (!baseTitles[category]) return [];

  const suggestions = baseTitles[category];
  return suggestions[propertyType] || [];
};

export default function StepBasicInfo({
  formData,
  updateFormData,
  errors,
  setErrors,
}) {
  const [locationStatus, setLocationStatus] = useState(null); // 'loading', 'success', 'error'
  const [locationError, setLocationError] = useState(null);
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

  const priceSuggestionsList = useMemo(() => {
    const category = formData.category;
    const propertyType = formData.propertyType;

    if (
      category &&
      propertyType &&
      priceSuggestions[category]?.[propertyType]
    ) {
      return priceSuggestions[category][propertyType];
    }
    return [];
  }, [formData.category, formData.propertyType]);

  const suggestedTitles = useMemo(() => {
    return generateTitleSuggestions(
      formData.category,
      formData.city || "Prime Location",
      formData.propertyType
    );
  }, [formData.category, formData.city, formData.propertyType]);

  const handleTitleChange = (title) => {
    updateFormData({ title });

    // Clear title error if fixed
    if (errors.title && title?.trim()) {
      const newErrors = { ...errors };
      delete newErrors.title;
      setErrors(newErrors);
    }
  };

  const handlePriceChange = (price) => {
    const numPrice = parseFloat(price);

    // Determine market range based on price
    let marketRange = "";
    if (numPrice > 0 && !isNaN(numPrice)) {
      const suggestion = priceSuggestionsList.find(
        (s) => numPrice >= s.min && numPrice <= s.max
      );
      if (suggestion) {
        marketRange = suggestion.label;
      }
    }

    if (isNaN(numPrice) || numPrice < 0) {
      updateFormData({ price: "", marketRange: "" });
    } else {
      updateFormData({ price: numPrice, marketRange: marketRange || formData.marketRange || "" });
    }

    // Clear errors if valid values entered
    if (errors.price || errors.marketRange) {
      const newErrors = { ...errors };
      let changed = false;

      if (numPrice > 0 && !isNaN(numPrice) && errors.price) {
        delete newErrors.price;
        changed = true;
      }

      if (marketRange && errors.marketRange) {
        delete newErrors.marketRange;
        changed = true;
      }

      if (changed) {
        setErrors(newErrors);
      }
    }
  };

  const handleLocationChange = (location) => {
    updateFormData({ location });

    // Clear location error if fixed
    if (errors.location && location?.trim()) {
      const newErrors = { ...errors };
      delete newErrors.location;
      setErrors(newErrors);
    }
  };

  const formatPrice = (price) => {
    // First check if price is null, undefined, empty string, or NaN
    if (!price && price !== 0) return "";
    if (price === "") return "";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return "";

    // Format Indian currency
    if (numPrice >= 10000000) {
      // 1 crore
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      // 1 lakh
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    } else {
      return `₹${numPrice.toLocaleString("en-IN")}`;
    }
  };

  const applyTitleSuggestion = (suggestion) => {
    updateFormData({ title: suggestion });
  };

  const applyPriceSuggestion = (suggestion) => {
    updateFormData({ price: suggestion.max });
  };

  // Get current location coordinates
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Update coordinates in form data
        updateFormData({
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        });

        setLocationStatus("success");
        setLocationError(null);

        // Clear success status after 3 seconds
        setTimeout(() => {
          setLocationStatus(null);
        }, 3000);
      },
      (error) => {
        setLocationStatus("error");

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location permissions and try again."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location information is unavailable. Please check your GPS settings."
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError(
              "An unknown error occurred while retrieving location."
            );
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Development helper function to fill form with sample data
  const fillSampleData = () => {
    updateFormData({
      title: "Beautiful 3BHK Apartment in Prime Location with Modern Amenities",
      price: 8500000,
      marketRange: "₹50-1.5 Crores",
      negotiable: "Yes",
      location: "Baner, Pune",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411045",
      address:
        "123 Main Street, Baner Pashan Link Road, Near Aundh IT Park, Baner, Pune - 411045",
      coordinates: {
        lat: 18.5642,
        lng: 73.7769,
      },
      description:
        "This stunning 3BHK apartment offers a perfect blend of modern luxury and comfort. Located in the heart of Baner, this property features spacious rooms, modern kitchen with appliances, 2 bathrooms, and a beautiful balcony with city views. The apartment comes with covered parking, 24/7 security, and access to world-class amenities including gym, swimming pool, and landscaped gardens. Close to IT parks, schools, hospitals, and shopping malls. Ready to move in condition with all basic furnishings included.",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Development Fill Data Button */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={fillSampleData}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Fill Sample Data
          </button>
        </div>
      )}
      {/* Property Title Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <FiTag className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Property Title <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="space-y-3">
          <textarea
            value={formData.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={`Enter a compelling title for your ${formData.category?.toLowerCase() || "property"
              }`}
            className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
            rows={3}
            maxLength={100}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted">
              {formData.title?.length || 0}/100 characters
            </div>
            <div className="flex items-center space-x-2">
              {formData.title && !errors.title && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-green-600 text-sm"
                >
                  <FiCheck size={14} />
                  <span>Looking good!</span>
                </motion.div>
              )}
              {errors.title && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-medium">
                    {errors.title}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Title Suggestions */}
        {suggestedTitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-2xl p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold text-heading flex items-center">
              <FiCheck className="mr-2 text-primary" size={16} />
              Suggested titles
            </h3>

            <div className="grid gap-2 max-h-48 overflow-y-auto sm:max-h-none sm:overflow-visible">
              {suggestedTitles.map((title, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyTitleSuggestion(title)}
                  className="w-full text-left p-3 sm:p-3 text-sm text-body bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-all duration-200 group touch-manipulation"
                >
                  <span className="line-clamp-2 group-hover:font-medium">
                    {title}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Price Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <span className="text-white text-lg">₹</span>
          </div>
          <label className="text-xl font-bold text-heading">
            {formData.propertyType === "rent" ? "Monthly Rent" : "Price"}
            {formData.propertyType === "rent" && (
              <span className="ml-2 text-sm text-muted font-normal">
                per month
              </span>
            )}
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {/* Price Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 w-full sm:w-80"
          >
            <label className="text-sm font-medium text-gray-700 block">
              {formData.propertyType === "rent" ? "Monthly Rent (₹):" : "Enter Price (₹):"}
            </label>
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder={formData.propertyType === "rent" ? "Enter monthly rent" : "Enter price in rupees"}
              className="w-full border border-gray-300 rounded-lg px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 touch-manipulation"
              min="0"
            />

            {formData.price && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-primary font-medium bg-primary/5 px-3 py-1 rounded-full inline-block"
              >
                {formatPrice(formData.price)} {formData.propertyType === "rent" ? "/ month" : ""}
              </motion.div>
            )}

            {errors.price && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.price}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Security Deposit (Only for Rent) */}
          {formData.propertyType === "rent" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3 w-full sm:w-80"
            >
              <label className="text-sm font-medium text-gray-700 block">
                Security Deposit (₹): <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.deposit || ""}
                onChange={(e) => updateFormData({ deposit: parseFloat(e.target.value) || "" })}
                placeholder="Enter deposit amount"
                className="w-full border border-gray-300 rounded-lg px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 touch-manipulation"
                min="0"
              />

              {formData.deposit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block"
                >
                  {formatPrice(formData.deposit)}
                </motion.div>
              )}

              {errors.deposit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-medium">
                    {errors.deposit}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 w-full sm:w-80"
          >
            <label className="text-sm font-medium text-gray-700 block">
              Market Range ({formData.propertyType}):{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="touch-manipulation">
              <Select
                value={
                  formData.price && formData.price > 0
                    ? priceSuggestionsList.find(
                      (s) =>
                        formData.price >= s.min && formData.price <= s.max
                    )
                      ? {
                        value: priceSuggestionsList
                          .find(
                            (s) =>
                              formData.price >= s.min &&
                              formData.price <= s.max
                          )
                          .min.toString(),
                        label: priceSuggestionsList.find(
                          (s) =>
                            formData.price >= s.min && formData.price <= s.max
                        ).label,
                      }
                      : null
                    : null
                }
                onChange={(selectedOption) => {
                  if (selectedOption && selectedOption.value !== "") {
                    // Find the suggestion by min value to get max
                    const suggestion = priceSuggestionsList.find(
                      (s) => s.min.toString() === selectedOption.value
                    );
                    if (suggestion) {
                      handlePriceChange(suggestion.max);
                    }
                  } else {
                    // Clear selection
                    updateFormData({ price: "" });
                  }
                }}
                options={[
                  { value: "", label: "Select market range", isDisabled: true },
                  ...priceSuggestionsList.map((suggestion) => ({
                    value: suggestion.min.toString(),
                    label: suggestion.label,
                    max: suggestion.max,
                  })),
                ]}
                placeholder="Select market range"
                isClearable={true}
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    padding: "0.125rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    "&:hover": {
                      borderColor: "#e90914",
                    },
                    "&:focus-within": {
                      borderColor: "#e90914",
                      boxShadow: "0 0 0 1px #e90914",
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
                  clearIndicator: (base, state) => ({
                    ...base,
                    color: state.isHovered ? "#dc2626" : "#6b7280",
                    "&:hover": {
                      color: "#dc2626",
                    },
                  }),
                }}
              />
            </div>
            {errors.marketRange && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.marketRange}
                </p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 min-w-[200px]"
          >
            <label className="text-sm font-medium text-gray-700 block">
              Negotiable: <span className="text-red-500">*</span>
            </label>
            <Select
              value={
                formData.negotiable
                  ? { value: formData.negotiable, label: formData.negotiable }
                  : null
              }
              onChange={(selectedOption) => {
                updateFormData({ negotiable: selectedOption?.value || "" });
              }}
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
              placeholder="Select negotiable status"
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.125rem",
                  fontSize: "0.875rem",
                  backgroundColor: "white",
                  "&:hover": {
                    borderColor: "#e90914",
                  },
                  "&:focus-within": {
                    borderColor: "#e90914",
                    boxShadow: "0 0 0 1px #e90914",
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
            {errors.negotiable && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.negotiable}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Price Insight */}
        {formData.price && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-green-600 text-lg">₹</span>
              <span className="font-semibold text-green-800">
                Price Insight
              </span>
            </div>
            <p className="text-green-700 text-sm">
              Your property falls in the{" "}
              <span className="font-semibold">
                {priceSuggestionsList.find(
                  (s) => formData.price >= s.min && formData.price <= s.max
                )?.label || "premium"}
              </span>{" "}
              range for {formData.category?.toLowerCase()} properties.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Location Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <FiMapPin className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Location Details
          </label>
        </div>

        {/* Address */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-heading">
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address || ""}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="Enter complete property address with landmark"
            className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation resize-none ${errors.address
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-red-500"
              }`}
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted">
              {formData.address?.length || 0}/200 characters
            </div>
            {errors.address && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.address}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Location/Area */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-heading">
            Area/Locality <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Baner, Andheri West, Koramangala"
            className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.location
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-red-500"
              }`}
          />
          {errors.location && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">
                {errors.location}
              </p>
            </motion.div>
          )}
        </div>

        {/* City, State, Pincode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-heading">City *</label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="e.g., Mumbai, Delhi, Bangalore"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.city
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-red-500"
                }`}
            />
            {errors.city && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.city}
                </p>
              </motion.div>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-heading">State *</label>
            <div className="touch-manipulation">
              <Select
                value={
                  formData.state
                    ? { value: formData.state, label: formData.state }
                    : null
                }
                onChange={(selectedOption) => {
                  updateFormData({ state: selectedOption?.value || "" });
                }}
                options={[
                  { value: "", label: "Select State", isDisabled: true },
                  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
                  { value: "Assam", label: "Assam" },
                  { value: "Bihar", label: "Bihar" },
                  { value: "Chhattisgarh", label: "Chhattisgarh" },
                  { value: "Delhi", label: "Delhi" },
                  { value: "Goa", label: "Goa" },
                  { value: "Gujarat", label: "Gujarat" },
                  { value: "Haryana", label: "Haryana" },
                  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
                  { value: "Jharkhand", label: "Jharkhand" },
                  { value: "Karnataka", label: "Karnataka" },
                  { value: "Kerala", label: "Kerala" },
                  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                  { value: "Maharashtra", label: "Maharashtra" },
                  { value: "Manipur", label: "Manipur" },
                  { value: "Meghalaya", label: "Meghalaya" },
                  { value: "Mizoram", label: "Mizoram" },
                  { value: "Nagaland", label: "Nagaland" },
                  { value: "Odisha", label: "Odisha" },
                  { value: "Punjab", label: "Punjab" },
                  { value: "Rajasthan", label: "Rajasthan" },
                  { value: "Sikkim", label: "Sikkim" },
                  { value: "Tamil Nadu", label: "Tamil Nadu" },
                  { value: "Telangana", label: "Telangana" },
                  { value: "Tripura", label: "Tripura" },
                  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                  { value: "Uttarakhand", label: "Uttarakhand" },
                  { value: "West Bengal", label: "West Bengal" },
                ]}
                placeholder="Select State"
                isClearable={false}
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    border: errors.state
                      ? "1px solid #ef4444"
                      : "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    padding: "0.125rem",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    "&:hover": {
                      borderColor: errors.state ? "#ef4444" : "#e90914",
                    },
                    "&:focus-within": {
                      borderColor: errors.state ? "#ef4444" : "#e90914",
                      boxShadow: errors.state
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
            {errors.state && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.state}
                </p>
              </motion.div>
            )}
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-heading">
              Pincode *
            </label>
            <input
              type="text"
              value={formData.pincode || ""}
              onChange={(e) => {
                // Only allow digits and limit to 6 characters
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                updateFormData({ pincode: value });
              }}
              placeholder="e.g., 400001"
              className={`w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 touch-manipulation ${errors.pincode
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-red-500"
                }`}
              maxLength={6}
            />
            {errors.pincode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-medium">
                  {errors.pincode}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Google Maps Coordinates */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <label className="text-sm font-medium text-heading">
              Google Maps Coordinates *
            </label>
            <span className="text-xs text-muted sm:text-right">
              Required for precise location
            </span>
          </div>

          {/* Coordinates Input Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 sm:items-end">
              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates?.lat || ""}
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value);
                    updateFormData({
                      coordinates: {
                        lat: isNaN(lat) ? undefined : lat,
                        lng: formData.coordinates?.lng,
                      },
                    });
                  }}
                  placeholder="e.g., 19.0760"
                  className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 touch-manipulation"
                  required
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates?.lng || ""}
                  onChange={(e) => {
                    const lng = parseFloat(e.target.value);
                    updateFormData({
                      coordinates: {
                        lat: formData.coordinates?.lat,
                        lng: isNaN(lng) ? undefined : lng,
                      },
                    });
                  }}
                  placeholder="e.g., 72.8777"
                  className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 touch-manipulation"
                  required
                />
              </div>

              {/* Use Current Location Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={getCurrentLocation}
                disabled={locationStatus === "loading"}
                className={`w-full sm:w-auto px-4 py-4 sm:py-3 rounded-lg font-medium transition-all border text-sm touch-manipulation ${locationStatus === "loading"
                  ? "bg-blue-50 text-blue-600 border-blue-200 cursor-not-allowed"
                  : locationStatus === "success"
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    : locationStatus === "error"
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-primary text-primary-foreground border-primary hover:opacity-90"
                  }`}
              >
                {locationStatus === "loading" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FiLoader className="animate-spin" size={16} />
                    <span>Getting...</span>
                  </div>
                ) : locationStatus === "success" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FiCheck size={16} />
                    <span>Location Set!</span>
                  </div>
                ) : locationStatus === "error" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FiNavigation size={16} />
                    <span>Try Again</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FiNavigation size={16} />
                    <span>Use Current Location</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>

          {/* Location Error Display */}
          {locationError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm">{locationError}</p>
            </motion.div>
          )}

          <p className="text-xs text-muted">
            Use the &ldquo;Current&rdquo; button to auto-populate coordinates
            from your location, or enter them manually for precise property
            mapping.
          </p>
        </motion.div>

        {/* Location Tips */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <FiMapPin className="mr-2" size={16} />
            Location Importance
          </h4>
          <p className="text-red-700 text-sm">
            Accurate location details help buyers find your property easily and
            improve search visibility. Include landmark details in the full
            address for better results.
          </p>
        </div>
      </motion.div>

      {/* Description Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <FiFileText className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Description <span className="text-red-500">*</span>
          </label>
        </div>

        <div className="space-y-3">
          <textarea
            value={formData.description || ""}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder={`Provide detailed description of your ${formData.category?.toLowerCase() || "property"
              }...`}
            className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none"
            rows={6}
            maxLength={1000}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted">
              {formData.description?.length || 0}/1000 characters
            </div>
            <div className="flex items-center space-x-2">
              {formData.description &&
                formData.description.length > 50 &&
                !errors.description && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-1 text-green-600 text-sm"
                  >
                    <FiCheck size={14} />
                    <span>Great description!</span>
                  </motion.div>
                )}
              {errors.description && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-medium">
                    {errors.description}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted">
          A good description includes property highlights, nearby amenities, and
          unique features.
        </p>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/10 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm">💡</span>
          </div>
          <h4 className="font-bold text-heading">Tips for Better Visibility</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-body">
                Use keywords like &ldquo;BHK&rdquo;, &ldquo;furnished&rdquo;,
                &ldquo;parking&rdquo;
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-body">
                Include property size, age, and unique features
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-body">
                Mention proximity to metro, schools, hospitals
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-body">
                Accurate pricing attracts qualified buyers
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
