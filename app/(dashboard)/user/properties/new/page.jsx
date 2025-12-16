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
        if (!formData.coordinates?.lat || isNaN(formData.coordinates.lat)) {
          stepErrors.coordinates = "Latitude is required";
        }
        if (!formData.coordinates?.lng || isNaN(formData.coordinates.lng)) {
          stepErrors.coordinates = "Longitude is required";
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

        // Common required fields for all property types
        if (!formData.floor?.trim()) {
          stepErrors.floor = "Floor is required";
        }
        if (!formData.totalFloors && formData.totalFloors !== 0) {
          stepErrors.totalFloors = "Total floors is required";
        }
        if (!formData.age && formData.age !== 0) {
          stepErrors.age = "Property age is required";
        }
        if (!formData.parking) {
          stepErrors.parking = "Parking information is required";
        }
        if (!formData.facing) {
          stepErrors.facing = "Property facing is required";
        }
        break;

      case 5: // Media Upload
        if (!formData.images?.length) {
          stepErrors.images = "At least one photo is required";
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
      <div id="wizard-top" className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Progress Bar */}
        <div className="mb-16">
          {/* Progress Overview */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
              <span className="text-sm font-medium text-heading">
                Step {currentStep} of {steps.length}
              </span>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm text-muted">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative">
              {/* Background Track */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep / steps.length) * 100}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>

              {/* Step Indicators */}
              <div className="absolute -top-2 left-0 right-0 flex justify-between px-3">
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
                        delay: index * 0.1,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      {/* Step Circle */}
                      <motion.div
                        className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-primary text-white ring-4 ring-primary/30"
                            : "bg-white text-gray-400 border-2 border-gray-300"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isCompleted ? (
                          <FiCheck size={10} />
                        ) : isCurrent ? (
                          <Icon size={10} />
                        ) : (
                          step.id
                        )}

                        {/* Pulse Animation for Current Step */}
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/30"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Step Label */}
                      <motion.div
                        className="mt-3 text-center"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <div
                          className={`text-xs font-medium ${
                            isCompleted
                              ? "text-green-600"
                              : isCurrent
                              ? "text-primary"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
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
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-8">
            <CurrentComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              setErrors={setErrors}
              onStepChange={jumpToStep}
              onPublish={handleSubmit}
              isPublishing={isSubmitting}
            />
          </div>
        </motion.div>

        {/* Responsive Navigation */}
        <div className="mt-8 space-y-4">
          {/* Progress counter - always visible */}
          <div className="text-center">
            <div className="text-sm text-body font-medium">
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

              <button
                onClick={
                  currentStep === steps.length ? handleSubmit : handleNext
                }
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
                {currentStep === steps.length ? (
                  <>
                    <FiCheck size={16} />
                    Publish Property
                  </>
                ) : (
                  <>
                    Next
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
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

              <button
                onClick={
                  currentStep === steps.length ? handleSubmit : handleNext
                }
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
                {currentStep === steps.length ? (
                  <>
                    <FiCheck size={16} />
                    Publish
                  </>
                ) : (
                  <>
                    Next
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
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
