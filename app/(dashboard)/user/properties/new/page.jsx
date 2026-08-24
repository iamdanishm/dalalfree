"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { useToast } from "@/app/lib/hooks/useToast";
import {
  FiHome,
  FiInfo,
  FiSettings,
  FiImage,
  FiEye,
  FiCheckCircle,
} from "react-icons/fi";

// Step Components
import StepTypeSelection from "./components/StepTypeSelection";
import StepBasicInfo from "./components/StepBasicInfo";
import StepSpecifications from "./components/StepSpecifications";
import StepAmenities from "./components/StepAmenities";
import StepMediaUpload from "./components/StepMediaUpload";
import StepKycVerification from "./components/StepKycVerification";
import StepReviewPublish from "./components/StepReviewPublish";

const steps = [
  {
    id: 1,
    title: "Property Type",
    subtitle: "Tell us what you're listing",
    icon: FiHome,
    component: StepTypeSelection,
  },
  {
    id: 2,
    title: "Basic Details",
    subtitle: "Title, description & price",
    icon: FiInfo,
    component: StepBasicInfo,
  },
  {
    id: 3,
    title: "Specifications",
    subtitle: "Rooms, area & features",
    icon: FiSettings,
    component: StepSpecifications,
  },
  {
    id: 4,
    title: "Amenities",
    subtitle: "Highlights & nearby places",
    icon: FiCheckCircle,
    component: StepAmenities,
  },
  {
    id: 5,
    title: "Photos & Videos",
    subtitle: "Showcase your property",
    icon: FiImage,
    component: StepMediaUpload,
  },
  {
    id: 6,
    title: "KYC Verification",
    subtitle: "Verify your identity",
    icon: FiCheckCircle,
    component: StepKycVerification,
  },
  {
    id: 7,
    title: "Review & Publish",
    subtitle: "Final review before publishing",
    icon: FiEye,
    component: StepReviewPublish,
  },
];

export default function PropertyWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(""); // "preparing", "uploading", "processing", "complete"
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const formRef = useRef(null);

  // Helper functions for storage operations
  const saveTempData = (data) => {
    sessionStorage.setItem("propertyWizardTempData", JSON.stringify(data));
  };

  const clearTempData = () => {
    sessionStorage.removeItem("propertyWizardTempData");
    sessionStorage.removeItem("propertyWizardFormData");
  };

  const clearAllWizardData = () => {
    localStorage.removeItem("propertyWizardData");
    clearTempData();
  };

  // Clear ALL stored data on component mount for fresh start
  // This ensures users get a completely fresh form every time they visit the page
  useEffect(() => {
    setFormData({});
    clearAllWizardData();

    // Only load temporary session data for step navigation if it exists
    // This allows navigation between steps without losing current progress
    const tempData = sessionStorage.getItem("propertyWizardTempData");
    if (tempData) {
      setFormData(JSON.parse(tempData));
      sessionStorage.removeItem("propertyWizardTempData");
    }
  }, []);

  // Clear any temp data when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => clearTempData();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Clear persisted wizard data when component unmounts (user navigates away)
  // This ensures fresh start when they come back via "Post Property" button
  useEffect(() => {
    return () => {
      localStorage.removeItem("propertyWizardData");
      sessionStorage.removeItem("propertyWizardFormData");
    };
  }, []);

  // Smooth scroll to top when step changes
  useEffect(() => {
    if (currentStep > 1) {
      // Delay to allow Framer Motion animation to complete
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 400); // Slightly longer delay

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const updateFormData = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
      lastUpdated: new Date(),
    }));
  };

  const validateStep = (stepId) => {
    const stepErrors = {};

    switch (stepId) {
      case 1: // Property Type & Category
        if (!formData.propertyType) {
          stepErrors.propertyType = "Please select a property type";
        }
        if (!formData.category) {
          stepErrors.category = "Please select a category";
        }
        break;

      case 2: // Basic Info
        if (!formData.title?.trim()) {
          stepErrors.title = "Title is required";
        }
        if (!formData.price || formData.price <= 0) {
          stepErrors.price = "Please enter a valid price";
        }
        if (!formData.marketRange?.trim()) {
          stepErrors.marketRange = "Market range is required";
        }
        if (!formData.negotiable?.trim()) {
          stepErrors.negotiable = "Negotiable status is required";
        }
        if (!formData.location?.trim()) {
          stepErrors.location = "Area/Locality is required";
        }
        if (!formData.city?.trim()) {
          stepErrors.city = "City is required";
        }
        if (!formData.state?.trim()) {
          stepErrors.state = "State is required";
        }
        if (!formData.pincode?.trim()) {
          stepErrors.pincode = "Pincode is required";
        } else if (formData.pincode.length !== 6) {
          stepErrors.pincode = "Pincode must be 6 digits";
        }
        if (!formData.address?.trim()) {
          stepErrors.address = "Full address is required";
        }
        if (!formData.coordinates?.lat || isNaN(formData.coordinates.lat)) {
          stepErrors.coordinates = "Latitude is required";
        }
        if (!formData.coordinates?.lng || isNaN(formData.coordinates.lng)) {
          stepErrors.coordinates = "Longitude is required";
        }
        if (!formData.description?.trim()) {
          stepErrors.description = "Description is required";
        }
        break;

      case 3: // Specifications
        // BHK required for Residential properties
        if (formData.category === "Residential" && !formData.bhk) {
          stepErrors.bhk = "BHK is required for residential properties";
        }

        // Bathroom required
        if (!formData.bathrooms) {
          stepErrors.bathrooms = "Number of bathrooms is required";
        }

        // Balcony required
        if (!formData.balcony && formData.balcony !== 0) {
          stepErrors.balcony = "Number of balconies is required";
        }

        // Furnishing status required
        if (!formData.furnishing) {
          stepErrors.furnishing = "Furnishing status is required";
        }

        // Built-up area required for all property types
        if (!formData.builtUpArea) {
          stepErrors.builtUpArea = "Built-up area is required";
        }

        // Carpet area required
        if (!formData.carpetArea) {
          stepErrors.carpetArea = "Carpet area is required";
        }

        // Floor required
        if (!formData.floor && formData.floor !== 0) {
          stepErrors.floor = "Floor is required";
        }

        // Total floors required
        if (!formData.totalFloors && formData.totalFloors !== 0) {
          stepErrors.totalFloors = "Total floors is required";
        }

        // Floor validation: specific floor cannot be greater than total floors
        if (
          formData.floor &&
          formData.totalFloors &&
          formData.floor > formData.totalFloors
        ) {
          stepErrors.floor =
            "Specific floor cannot be greater than total floors in the building";
        }

        // Property age required
        if (!formData.age && formData.age !== 0) {
          stepErrors.age = "Property age is required";
        }

        // Parking required
        if (!formData.parking) {
          stepErrors.parking = "Parking information is required";
        }

        // Property facing required
        if (!formData.facing) {
          stepErrors.facing = "Property facing is required";
        }

        // Possession status required
        if (!formData.possessionStatus) {
          stepErrors.possessionStatus = "Possession status is required";
        }
        break;

      case 4: // Amenities & Highlights
        // Society amenities validation (at least one amenity should be selected)
        if (
          !formData.societyAmenities ||
          formData.societyAmenities.length === 0
        ) {
          stepErrors.societyAmenities =
            "Please select at least one society amenity";
        }

        // Nearby places validation (at least 2 places with complete and valid information required)
        const validNearbyPlaces = (formData.nearbyPlaces || []).filter(
          (place) => {
            if (!place.type || !place.name || !place.distance) return false;
            // Check distance format
            if (!/^\d+(\.\d+)?(m|km)$/.test(place.distance)) return false;
            // Check rating is between 1-5
            if (place.rating && (place.rating < 1 || place.rating > 5))
              return false;
            return true;
          }
        );
        if (validNearbyPlaces.length < 2) {
          stepErrors.nearbyPlaces =
            "Please add at least 2 nearby places with complete and valid information (proper distance format like 100m, 1.5km, and rating 1-5)";
        }

        // Key highlights validation (at least one highlight required)
        if (!formData.highlights || formData.highlights.length === 0) {
          stepErrors.highlights = "Please add at least one key highlight";
        }
        break;

      case 5: // Media Upload
        if (!formData.images?.length) {
          stepErrors.images = "At least one photo is required";
        }
        break;

      case 6: // KYC Verification
        // Validate Aadhaar (1-2 images or 1 PDF)
        const aadhaarFiles = formData.kycFiles?.aadhaar;
        if (!aadhaarFiles || aadhaarFiles.length === 0) {
          stepErrors.aadhaar = "Aadhaar card is required";
        }

        // Validate PAN Card (1 image or PDF)
        if (!formData.kycFiles?.pan) {
          stepErrors.pan = "PAN card is required";
        }

        // Validate Property Agreement (PDF only)
        if (!formData.kycFiles?.agreement) {
          stepErrors.agreement = "Property agreement document is required";
        }

        // Validate Video Verification
        if (!formData.kycFiles?.video) {
          stepErrors.video = "Video verification is required";
        }
        break;

      case 7: // Review & Publish
        if (!acceptedTerms) {
          stepErrors.terms =
            "You must accept the terms and conditions to publish";
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        saveTempData(formData);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      saveTempData(formData);
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepId) => {
    saveTempData(formData);
    setCurrentStep(stepId);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStatus("preparing");

    try {
      // Import the helper function
      const { createPropertyFormData } = await import(
        "@/app/lib/propertyHelpers"
      );

      // Update progress: Preparing data
      setUploadProgress(10);
      setUploadStatus("preparing");

      // Prepare property data for API
      const propertyData = {
        ...formData,
      };

      // Calculate total file size for progress tracking
      const calculateTotalSize = (files) => {
        return files.reduce((total, file) => total + (file.size || 0), 0);
      };

      const imageSize = calculateTotalSize(formData.images || []);
      const videoSize = calculateTotalSize(formData.videos || []);
      const kycSize = calculateTotalSize(
        [
          ...(formData.kycFiles?.aadhaar || []),
          formData.kycFiles?.pan,
          formData.kycFiles?.agreement,
          formData.kycFiles?.video,
        ].filter(Boolean)
      );

      // Update progress: Creating FormData
      setUploadProgress(20);
      setUploadStatus("preparing");

      // Create complete FormData with files
      const formDataToSubmit = createPropertyFormData(propertyData, {
        images: formData.images || [],
        videos: formData.videos || [],
        kycFiles: formData.kycFiles || {},
      });

      // Update progress: Starting upload
      setUploadProgress(50);
      setUploadStatus("uploading");

      // Submit to new API endpoint
      const response = await fetch("/api/properties/create", {
        method: "POST",
        body: formDataToSubmit, // No Content-Type header needed for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          console.error("Backend validation details:", errorData.details);
          setErrors(errorData.details);
          const detailMsgs = Object.entries(errorData.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(" | ");
          throw new Error(`Validation failed: ${detailMsgs}`);
        }
        throw new Error(
          errorData.error || errorData.message || "Failed to create property"
        );
      }

      // Update progress: Processing response
      setUploadProgress(80);
      setUploadStatus("processing");

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || result.message || "Failed to create property"
        );
      }

      // Update progress: Finalizing
      setUploadProgress(90);
      setUploadStatus("complete");

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Clear all saved data
      clearAllWizardData();

      // Final progress update
      setUploadProgress(100);

      // Show success toast
      success("Property created successfully! 🎉");

      // Redirect to success page or property management
      router.push(
        `/user/properties?success=true&propertyId=${result.property.id}`
      );
    } catch (error) {
      console.error("Property creation failed:", error);
      console.error("Error details:", error.message);
      setErrors({ submit: error.message });
      setUploadStatus("error");

      // Show error toast
      showError(error.message || "Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
      }, 3000);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("propertyWizardData", JSON.stringify(formData));
    // Could add toast notification here
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated or not a user
  if (status === "unauthenticated" || session?.user?.role !== "user") {
    return null;
  }

  const currentStepData = steps.find((step) => step.id === currentStep);
  const CurrentComponent = currentStepData?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        id="wizard-top"
        className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl sm:max-w-full"
      >
        {/* Enhanced Progress Bar */}
        <div className="mb-12 sm:mb-16">
          {/* Progress Overview */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full shadow-sm border border-gray-100"
            >
              <span className="text-sm font-semibold text-heading">
                Step {currentStep} of {steps.length}
              </span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm font-medium text-primary">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative">
              {/* Background Track */}
              <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep / steps.length) * 100}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>

              {/* Step Indicators */}
              <div className="absolute -top-2.5 sm:-top-2 left-0 right-0 flex justify-between px-1 sm:px-2 md:px-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      {/* Step Circle - Touch-friendly on mobile */}
                      <motion.div
                        className={`relative w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-md transition-all duration-200 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-primary text-white ring-4 ring-primary/20 sm:ring-4"
                            : "bg-white text-gray-400 border-2 border-gray-300 hover:border-primary/40"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isCompleted ? (
                          <FiCheck size={14} />
                        ) : isCurrent ? (
                          <Icon size={14} />
                        ) : (
                          <span className="text-xs sm:text-sm">{step.id}</span>
                        )}

                        {/* Pulse Animation for Current Step - Optimized for mobile */}
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20 sm:bg-primary/30"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.4, 0, 0.4],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Step Label - Enhanced for mobile */}
                      <motion.div
                        className="mt-2 sm:mt-3 text-center hidden sm:block"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <div
                          className={`text-xs sm:text-sm font-medium leading-tight ${
                            isCompleted
                              ? "text-green-600"
                              : isCurrent
                              ? "text-primary font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </div>
                      </motion.div>

                      {/* Mobile-only abbreviated labels */}
                      <motion.div
                        className="mt-1 text-center sm:hidden"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <div
                          className={`text-[10px] font-medium leading-tight whitespace-nowrap ${
                            isCompleted
                              ? "text-green-600"
                              : isCurrent
                              ? "text-primary font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title.split(" ")[0]}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          ref={formRef}
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <CurrentComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              setErrors={setErrors}
              onStepChange={jumpToStep}
              onPublish={handleSubmit}
              isPublishing={isSubmitting}
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
            />
          </div>
        </motion.div>

        {/* Responsive Navigation */}
        <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex justify-end items-center">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-all hover:scale-105"
                >
                  <FiArrowLeft size={16} />
                  Previous
                </button>
              )}

              {currentStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isSubmitting
                      ? "bg-muted text-muted cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 shadow-sm"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : null}
                  <FiCheck size={16} />
                  {isSubmitting ? "Publishing..." : "Publish Property"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 rounded-lg font-medium transition-all hover:scale-105 shadow-sm"
                >
                  Next
                  <FiArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile: Vertical layout */}
          <div className="md:hidden space-mobile">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="btn-touch flex items-center justify-center gap-2 flex-1 px-6 py-4 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-mobile-lg font-medium animate-mobile touch-feedback"
                >
                  <FiArrowLeft size={18} />
                  Previous
                </button>
              )}

              {currentStep === steps.length ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className={`btn-touch flex items-center justify-center gap-2 flex-1 px-6 py-4 rounded-mobile-lg font-bold text-lg animate-mobile touch-feedback ${
                    isSubmitting
                      ? "bg-muted text-muted cursor-not-allowed"
                      : "bg-linear-to-r from-green-500 to-green-600 text-white shadow-mobile-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  ) : (
                    <FiCheck size={20} />
                  )}
                  {isSubmitting ? "Publishing..." : "Publish Property"}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  whileTap={{ scale: 0.98 }}
                  className="btn-touch flex items-center justify-center gap-2 flex-1 px-6 py-4 bg-linear-to-r from-primary to-primary/90 text-white rounded-mobile-lg font-bold text-lg animate-mobile shadow-mobile-lg touch-feedback"
                >
                  Next
                  <FiArrowRight size={18} />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Progress Display */}
        {isSubmitting && uploadProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 md:mt-4 p-6 md:p-4 bg-blue-50 border border-blue-200 rounded-xl md:rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">
                  {uploadStatus === "preparing" && "Preparing your property..."}
                  {uploadStatus === "uploading" && "Uploading files..."}
                  {uploadStatus === "processing" && "Processing property..."}
                  {uploadStatus === "complete" && "Almost done..."}
                  {uploadStatus === "error" && "Upload failed"}
                </h3>
                <p className="text-sm text-blue-600">
                  {uploadStatus === "preparing" &&
                    "Validating data and preparing files"}
                  {uploadStatus === "uploading" &&
                    "Sending images, videos, and documents"}
                  {uploadStatus === "processing" &&
                    "Creating property listing and verifying documents"}
                  {uploadStatus === "complete" &&
                    "Property created successfully!"}
                  {uploadStatus === "error" && "Please check the errors below"}
                </p>
              </div>
            </div>

            <div className="w-full bg-blue-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-2 text-right">
              <span className="text-sm font-medium text-blue-700">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 md:mt-4 p-6 md:p-4 bg-red-50 border border-red-200 rounded-xl md:rounded-lg shadow-sm"
          >
            <div className="flex items-start space-x-3 mb-3 md:mb-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <h3 className="text-base md:text-sm font-semibold text-red-800 leading-relaxed">
                Please fix the following errors:
              </h3>
            </div>
            <ul className="text-base md:text-sm text-red-700 space-y-2 md:space-y-1 ml-9 md:ml-9">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="leading-relaxed">
                  • {error}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
