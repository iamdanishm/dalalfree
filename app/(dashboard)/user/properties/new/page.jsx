"use client";

import React, { useState, useEffect } from "react";
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

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("propertyWizardData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Auto-save form data every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      localStorage.setItem("propertyWizardData", JSON.stringify(formData));
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

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
          stepErrors.location = "Location is required";
        }
        break;

      case 3: // Specifications
        // Make these required only for Residential properties
        if (formData.category === "Residential") {
          if (!formData.bhk) {
            stepErrors.bhk = "BHK is required for residential properties";
          }
          if (!formData.area) {
            stepErrors.area = "Area is required";
          }
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
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepId) => {
    // Allow jumping to any step that's valid, but validate completed steps
    setCurrentStep(stepId);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ownerId: session?.user?._id,
          status: "pending", // All new properties start as pending
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create property");
      }

      const property = await response.json();

      // Clear saved data
      localStorage.removeItem("propertyWizardData");

      // Redirect to success page or property management
      router.push(`/user/properties?success=true&propertyId=${property._id}`);
    } catch (error) {
      console.error("Property creation failed:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Responsive Progress Bar */}
        <div className="mb-8">
          {/* Desktop: Horizontal steps */}
          <div className="hidden md:flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCompleted ? <FiCheck size={16} /> : <Icon size={16} />}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? "text-primary font-medium" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: Simplified progress indicator */}
          <div className="md:hidden flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCompleted ? <FiCheck size={10} /> : step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-4 h-0.5 mx-1 ${
                          step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current step info */}
          <div className="text-center">
            <div className="text-lg font-semibold text-heading">
              {currentStepData?.title}
            </div>
            <div className="text-sm text-muted">
              {currentStepData?.subtitle}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
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
