"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiSave } from "react-icons/fi";
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

export default function PropertyWizard({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoadingKyc, setIsLoadingKyc] = useState(true);
  const formRef = useRef(null);

  // Load temporary session data for step navigation (cleared on refresh)
  useEffect(() => {
    const tempData = sessionStorage.getItem("propertyWizardTempData");
    if (tempData) {
      setFormData(JSON.parse(tempData));
      // Clear the temp data after loading
      sessionStorage.removeItem("propertyWizardTempData");
    }
  }, []);

  // Clear any temp data when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("propertyWizardTempData");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Check KYC status on component mount
  useEffect(() => {
    const checkKycStatus = async () => {
      if (session?.user?._id) {
        try {
          const response = await fetch("/api/kyc");
          if (response.ok) {
            const kycData = await response.json();
            setKycStatus(kycData.status || "none");
          } else {
            setKycStatus("none");
          }
        } catch (error) {
          console.error("Error checking KYC status:", error);
          setKycStatus("none");
        } finally {
          setIsLoadingKyc(false);
        }
      }
    };

    if (status === "authenticated") {
      checkKycStatus();
    }
  }, [session, status]);

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
        // BHK and Area required for Residential properties
        if (formData.category === "Residential") {
          if (!formData.bhk) {
            stepErrors.bhk = "BHK is required for residential properties";
          }
          if (!formData.builtUpArea) {
            stepErrors.builtUpArea = "Built-up area is required";
          }
        } else {
          // Area required for all other property types
          if (!formData.area) {
            stepErrors.area = "Area is required";
          }
        }

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

        // Built-up area required
        if (!formData.builtUpArea) {
          stepErrors.builtUpArea = "Built-up area is required";
        }

        // Carpet area required
        if (!formData.carpetArea) {
          stepErrors.carpetArea = "Carpet area is required";
        }

        // Floor required
        if (!formData.floor?.trim()) {
          stepErrors.floor = "Floor is required";
        }

        // Total floors required
        if (!formData.totalFloors && formData.totalFloors !== 0) {
          stepErrors.totalFloors = "Total floors is required";
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

        // Nearby places validation (at least 2 places required)
        const validNearbyPlaces = (formData.nearbyPlaces || []).filter(
          (place) => place.type && place.name && place.distance
        );
        if (validNearbyPlaces.length < 2) {
          stepErrors.nearbyPlaces =
            "Please add at least 2 nearby places with complete information";
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
        // Save current form data temporarily for step navigation
        sessionStorage.setItem(
          "propertyWizardTempData",
          JSON.stringify(formData)
        );
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Save current form data temporarily for step navigation
      sessionStorage.setItem(
        "propertyWizardTempData",
        JSON.stringify(formData)
      );
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepId) => {
    // Save current form data temporarily for step navigation
    sessionStorage.setItem("propertyWizardTempData", JSON.stringify(formData));
    // Allow jumping to any step that's valid, but validate completed steps
    setCurrentStep(stepId);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Combine floor and totalFloors for storage
      const combinedFloor =
        formData.floor && formData.totalFloors
          ? `${formData.floor} of ${formData.totalFloors}`
          : formData.floor || "";

      // Upload media files first if any
      let uploadedImages = [];
      let uploadedVideos = [];

      if (formData.images && formData.images.length > 0) {
        uploadedImages = await uploadMediaFiles(formData.images, "images");
      }

      if (formData.videos && formData.videos.length > 0) {
        uploadedVideos = await uploadMediaFiles(formData.videos, "videos");
      }

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
          videos: uploadedVideos,
          floor: combinedFloor,
          ownerId: session?.user?._id,
          status: "pending", // All new properties start as pending
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create property");
      }

      const property = await response.json();

      // Clear all saved data
      localStorage.removeItem("propertyWizardData");
      sessionStorage.removeItem("propertyWizardTempData");

      // Redirect to success page or property management
      router.push(`/user/properties?success=true&propertyId=${property._id}`);
    } catch (error) {
      console.error("Property creation failed:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload media files function
  const uploadMediaFiles = async (mediaFiles, type) => {
    const uploadedFiles = [];

    for (const mediaFile of mediaFiles) {
      if (!mediaFile.file) continue; // Skip if no actual file object

      const formDataUpload = new FormData();
      formDataUpload.append("file", mediaFile.file);
      formDataUpload.append("type", type);
      formDataUpload.append("category", mediaFile.category || "other");
      formDataUpload.append("alt", mediaFile.alt || mediaFile.name);

      try {
        const response = await fetch("/api/properties/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          console.error(`Failed to upload ${mediaFile.name}`);
          continue; // Skip failed uploads
        }

        const result = await response.json();

        // Add uploaded file info
        uploadedFiles.push({
          url: result.url,
          src: result.url,
          type: type === "images" ? "image" : "video",
          category: mediaFile.category,
          alt: mediaFile.alt,
          order: mediaFile.order,
          ...(type === "videos" && {
            thumbnail: result.thumbnail,
            title: mediaFile.name,
            duration: result.duration || 0,
          }),
        });
      } catch (error) {
        console.error(`Error uploading ${mediaFile.name}:`, error);
        // Continue with other files
      }
    }

    return uploadedFiles;
  };

  const handleSaveDraft = () => {
    localStorage.setItem("propertyWizardData", JSON.stringify(formData));
    // Could add toast notification here
  };

  const handleCompleteKyc = () => {
    // Save current form data before redirecting
    sessionStorage.setItem("propertyWizardTempData", JSON.stringify(formData));
    // Redirect to KYC upload page
    router.push("/kyc");
  };

  // Show loading state while checking authentication
  if (status === "loading" || (status === "authenticated" && !session?.user)) {
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
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
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
                            ? "bg-primary text-white ring-4 ring-primary/20 sm:ring-4 ring-primary/30"
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
          {/* Progress counter - always visible */}
          <div className="text-center mb-2 sm:mb-0">
            <div className="text-sm text-body font-medium px-4 py-2">
              Step {currentStep} of {steps.length}
            </div>
          </div>

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
                // Show KYC button or Publish button based on KYC status
                kycStatus === "approved" ? (
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
                    Publish Property
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteKyc}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium transition-all hover:scale-105 shadow-sm"
                  >
                    <FiCheck size={16} />
                    Complete KYC First
                  </button>
                )
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
          <div className="md:hidden space-y-3">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition-all active:scale-95"
                >
                  <FiArrowLeft size={16} />
                  Previous
                </button>
              )}

              {currentStep === steps.length ? (
                // Show KYC button or Publish button based on KYC status
                kycStatus === "approved" ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      isSubmitting
                        ? "bg-muted text-muted cursor-not-allowed"
                        : "bg-primary text-primary-foreground active:scale-95 shadow-sm"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                    ) : null}
                    <FiCheck size={16} />
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteKyc}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-lg font-medium transition-all active:scale-95 shadow-sm"
                  >
                    <FiCheck size={16} />
                    Complete KYC
                  </button>
                )
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all active:scale-95 shadow-sm"
                >
                  Next
                  <FiArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Please fix the following errors:
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
