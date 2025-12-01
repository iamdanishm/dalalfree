"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiHome, FiTrendingUp, FiMapPin, FiTrendingDown } from "react-icons/fi";

// Modern property types with dalal free theme
const propertyTypes = [
  {
    id: "sell",
    label: "Sell",
    description: "List your property for sale",
    icon: FiHome,
    gradient: "from-primary to-red-600",
    lightBg: "bg-red-50",
    textColor: "text-primary",
    shadow: "hover:shadow-red-100",
  },
  {
    id: "rent",
    label: "Rent",
    description: "List your property for rent",
    icon: FiTrendingUp,
    gradient: "from-green-500 to-emerald-600",
    lightBg: "bg-green-50",
    textColor: "text-green-600",
    shadow: "hover:shadow-green-100",
  },
];

// Modern categories with better visual hierarchy
const categories = [
  {
    id: "Residential",
    label: "Residential",
    description: "Houses, apartments & homes",
    examples: ["1BHK", "2BHK", "3BHK", "Villa", "Apartment"],
    gradient: "from-blue-500 to-blue-600",
    icon: FiHome,
    features: ["Family-friendly", "Living spaces", "Modern homes"],
  },
  {
    id: "Commercial",
    label: "Commercial",
    description: "Offices, shops & business spaces",
    examples: ["Office", "Shop", "Warehouse", "Showroom"],
    gradient: "from-purple-500 to-purple-600",
    icon: FiTrendingDown,
    features: ["Business spaces", "Investment", "Yield potential"],
  },
  {
    id: "Industrial",
    label: "Industrial",
    description: "Factories, warehouses & industrial spaces",
    examples: ["Factory", "Warehouse", "Industrial Land"],
    gradient: "from-orange-500 to-orange-600",
    icon: FiTrendingUp,
    features: ["Manufacturing", "Production", "Large scale"],
  },
  {
    id: "Land",
    label: "Land",
    description: "Plots, agricultural & open land",
    examples: ["Plot", "Agricultural Land", "Farm"],
    gradient: "from-yellow-500 to-amber-600",
    icon: FiMapPin,
    features: ["Investment", "Development", "Future value"],
  },
];

export default function StepTypeSelection({
  formData,
  updateFormData,
  errors,
}) {
  const handleTypeSelect = (propertyType) => {
    updateFormData({ propertyType });
  };

  const handleCategorySelect = (category) => {
    updateFormData({ category });
  };

  // Animation variants matching the project theme
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Page Header - Clear indication of what page they're on */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-heading mb-2">
          Add New Property
        </h1>
        <p className="text-muted text-lg">
          Let's start by choosing what type of property you want to list
        </p>
      </motion.div>

      {/* Property Type Selection */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-heading mb-6">
          What would you like to do?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.propertyType === type.id;

            return (
              <motion.button
                key={type.id}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTypeSelect(type.id)}
                className={`relative group p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? `border-primary bg-gradient-to-r ${type.lightBg} shadow-lg scale-105`
                    : "border-border bg-background hover:border-primary/50 hover:shadow-lg"
                }`}
                style={{ willChange: "transform" }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-4 right-4"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${type.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-1 ${
                        isSelected ? "text-primary" : "text-heading"
                      }`}
                    >
                      {type.label}
                    </h3>
                    <p className="text-body mb-3 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {errors.propertyType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm font-medium">
              {errors.propertyType}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Category Selection - Only show when property type is selected */}
      {formData.propertyType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="text-xl font-semibold text-heading mb-6">
            What type of property are you listing?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isSelected = formData.category === category.id;

              return (
                <motion.button
                  key={category.id}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                      : "border-border bg-surface hover:border-primary/30 hover:shadow-lg hover:bg-background"
                  }`}
                  style={{ willChange: "transform" }}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {/* Main content */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} text-white shadow-sm`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold ${
                            isSelected ? "text-primary" : "text-heading"
                          }`}
                        >
                          {category.label}
                        </h3>
                      </div>
                    </div>

                    <p className="text-body text-sm leading-relaxed">
                      {category.description}
                    </p>

                    {/* Examples */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-heading">
                        Common examples:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.examples.map((example, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              isSelected
                                ? "bg-primary/10 text-primary"
                                : "bg-white/90 text-heading shadow-sm border border-border/50"
                            }`}
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key features */}
                    <div className="flex flex-wrap gap-1">
                      {category.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/50 text-muted text-xs rounded-full border border-border"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {errors.category && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm font-medium">
                {errors.category}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Selection Summary */}
      {formData.propertyType && formData.category && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <FiHome className="text-white" size={16} />
            </div>
            <h4 className="text-lg font-bold text-heading">Perfect Choice!</h4>
          </div>

          <p className="text-body mb-2">
            You are listing a{" "}
            <span className="font-semibold text-primary">
              {formData.category.toLowerCase()}
            </span>{" "}
            property{" "}
            <span className="font-semibold text-primary">
              for {formData.propertyType}
            </span>
          </p>

          <p className="text-sm text-muted">
            This helps us customize the listing form and show your property to
            the right buyers in the Indian market.
          </p>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        variants={itemVariants}
        className="bg-surface border border-border rounded-2xl p-6"
      >
        <h4 className="font-semibold text-heading mb-3 flex items-center">
          <FiMapPin className="mr-2 text-primary" size={18} />
          Not sure what to choose?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-body">
          <div>
            <p className="font-medium text-heading mb-1">
              Residential properties
            </p>
            <p>Houses, apartments, villas, and residential buildings</p>
          </div>
          <div>
            <p className="font-medium text-heading mb-1">
              Commercial properties
            </p>
            <p>Offices, shops, warehouses, and business spaces</p>
          </div>
          <div>
            <p className="font-medium text-heading mb-1">
              Industrial properties
            </p>
            <p>Factories, manufacturing spaces, and logistics centers</p>
          </div>
          <div>
            <p className="font-medium text-heading mb-1">Land properties</p>
            <p>Open plots, agricultural land, and development sites</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
