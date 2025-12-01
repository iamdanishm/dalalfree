import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { FiTag, FiMapPin, FiFileText, FiCheck } from "react-icons/fi";

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
      sell: `${category} Space for Sale in ${city} - Prime Business Location`,
      rent: `${category} on Rent in ${city} - High Footfall Area`,
    },
    Land: {
      sell: `Prime Land for Sale in ${city} - Investment Opportunity`,
    },
  };

  if (!baseTitles[category]) return [];

  const suggestions = baseTitles[category];
  return typeof suggestions === "string"
    ? [suggestions]
    : suggestions[propertyType] || [];
};

export default function StepBasicInfo({
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
    if (isNaN(numPrice) || numPrice < 0) {
      updateFormData({ price: "" });
    } else {
      updateFormData({ price: numPrice });
    }

    // Clear price error if valid price entered
    if (errors.price && numPrice > 0 && !isNaN(numPrice)) {
      const newErrors = { ...errors };
      delete newErrors.price;
      setErrors(newErrors);
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Property Title Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <FiTag className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">
            Property Title
          </label>
        </div>

        <div className="space-y-3">
          <textarea
            value={formData.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={`Enter a compelling title for your ${
              formData.category?.toLowerCase() || "property"
            }`}
            className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
            rows={3}
            maxLength={100}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted">
              {formData.title?.length || 0}/100 characters
            </div>
            {formData.title && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 text-green-600 text-sm"
              >
                <FiCheck size={14} />
                <span>Looking good!</span>
              </motion.div>
            )}
          </div>

          {errors.title && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">{errors.title}</p>
            </motion.div>
          )}
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

            <div className="grid gap-2">
              {suggestedTitles.map((title, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyTitleSuggestion(title)}
                  className="w-full text-left p-3 text-sm text-body bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-all duration-200 group"
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
            Price
            {formData.propertyType === "rent" && (
              <span className="ml-2 text-sm text-muted font-normal">
                per month
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-row gap-6 items-start flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 w-80"
          >
            <label className="text-sm font-medium text-gray-700 block">
              Enter Price (₹):
            </label>
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="Enter price in rupees"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              min="0"
            />

            {formData.price && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-primary font-medium bg-primary/5 px-3 py-1 rounded-full inline-block"
              >
                {formatPrice(formData.price)}
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 min-w-[280px]"
          >
            <label className="text-sm font-medium text-gray-700 block">
              Market Range ({formData.propertyType}):
            </label>
            <Select
              value={
                formData.price && formData.price > 0
                  ? priceSuggestionsList.find(
                      (s) => formData.price >= s.min && formData.price <= s.max
                    )
                    ? {
                        value: priceSuggestionsList
                          .find(
                            (s) =>
                              formData.price >= s.min && formData.price <= s.max
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
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: "0.875rem",
                  backgroundColor: state.isFocused ? "#fef2f2" : "white",
                  color: state.isFocused ? "#111827" : "#374151",
                  "&:hover": {
                    backgroundColor: "#fef2f2",
                    color: "#111827",
                  },
                  "&:active": {
                    backgroundColor: "#fecaca",
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 min-w-[200px]"
          >
            <label className="text-sm font-medium text-gray-700 block">
              Negotiable:
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
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: "0.875rem",
                  backgroundColor: state.isFocused ? "#fef2f2" : "white",
                  color: state.isFocused ? "#111827" : "#374151",
                  "&:hover": {
                    backgroundColor: "#fef2f2",
                    color: "#111827",
                  },
                  "&:active": {
                    backgroundColor: "#fecaca",
                  },
                }),
              }}
            />
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
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <FiMapPin className="text-white" size={18} />
          </div>
          <label className="text-xl font-bold text-heading">Location</label>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Baner, Pune, Maharashtra"
            className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
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

          <p className="text-sm text-muted flex items-center">
            <FiMapPin className="mr-2" size={14} />
            Enter full address including area, city, and state for better
            visibility
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
            Description
            <span className="ml-2 text-sm text-muted font-normal">
              (Optional)
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <textarea
            value={formData.description || ""}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder={`Provide detailed description of your ${
              formData.category?.toLowerCase() || "property"
            }...`}
            className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none"
            rows={6}
            maxLength={1000}
          />

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted">
              {formData.description?.length || 0}/1000 characters
            </div>
            {formData.description && formData.description.length > 50 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 text-green-600 text-sm"
              >
                <FiCheck size={14} />
                <span>Great description!</span>
              </motion.div>
            )}
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
