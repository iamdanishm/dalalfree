/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEye,
  FiEdit3,
  FiHome,
  FiInfo,
  FiSettings,
  FiCheckCircle,
  FiImage,
  FiVideo,
  FiMapPin,
  FiCheck,
  FiSave,
} from "react-icons/fi";
import Image from "next/image";

// Utility function to get ordinal suffix
const getOrdinalSuffix = (num) => {
  if (!num || isNaN(num)) return num;
  const j = num % 10;
  const k = num % 100;
  if (j == 1 && k != 11) return num + "st";
  if (j == 2 && k != 12) return num + "nd";
  if (j == 3 && k != 13) return num + "rd";
  return num + "th";
};

export default function StepReviewPublish({
  formData,
  updateFormData,
  errors,
  setErrors,
  onStepChange,
  onPublish,
  isPublishing = false,
  acceptedTerms,
  setAcceptedTerms,
  originalProperty,
}) {
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
  const [amenitiesMap, setAmenitiesMap] = useState({});

  // Fetch amenities for proper display
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await fetch("/api/amenities");
        if (res.ok) {
          const data = await res.json();
          const amenityMap = {};
          data.amenities.forEach((amenity) => {
            amenityMap[amenity._id] = amenity.title;
          });
          setAmenitiesMap(amenityMap);
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };
    fetchAmenities();
  }, []);

  // Combine existing and new media for display in edit mode, filtering out removed items
  const displayImages = [
    ...(formData.existingImages || []).filter(
      (img) =>
        img &&
        img.url &&
        !(formData.removedImages || []).includes(img.url) &&
        img.url.includes("/images/")
    ),
    ...(formData.images || []),
  ];
  const displayVideos = [
    ...(formData.existingVideos || []).filter(
      (vid) =>
        vid &&
        vid.url &&
        !(formData.removedVideos || []).includes(vid.url) &&
        vid.url.includes("/videos/")
    ),
    ...(formData.videos || []),
  ];

  // Handle video click - pause previous video and start new one
  const handleVideoClick = (videoIndex, videoRef, event) => {
    event.preventDefault(); // Prevent default video controls from interfering

    const videoElement = videoRef.current;
    if (!videoElement) return;

    // If clicking the same video that's currently playing, pause it
    if (playingVideoIndex === videoIndex) {
      videoElement.pause();
      setPlayingVideoIndex(null);
    } else {
      // Pause the currently playing video if any
      if (playingVideoIndex !== null) {
        const prevVideo = document.querySelector(
          `video[data-video-index="${playingVideoIndex}"]`
        );
        if (prevVideo) {
          prevVideo.pause();
        }
      }
      // Start the new video
      setPlayingVideoIndex(videoIndex);
      videoElement.play();
    }
  };

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

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format area for display
  const formatArea = (area, unit = "sq ft") => {
    if (!area) return "Not specified";
    return `${area} ${unit}`;
  };

  // Get category display name
  const getCategoryDisplay = (category) => {
    const categoryMap = {
      Residential: "🏠 Residential",
      Commercial: "🏢 Commercial",
      Industrial: "🏭 Industrial",
      Land: "🌱 Land",
    };
    return categoryMap[category] || category;
  };

  // Get amenity display names
  const getAmenityNames = (amenityIds) => {
    return (
      amenityIds
        ?.map((id) => amenitiesMap[id] || (typeof id === "object" ? id?.name || id?.title : id))
        .filter(Boolean) || []
    );
  };

  const stepSections = [
    {
      id: 1,
      title: "Property Type & Category",
      icon: FiHome,
      data: [
        { label: "Property Type", value: formData.propertyType },
        { label: "Category", value: getCategoryDisplay(formData.category) },
      ],
    },
    {
      id: 2,
      title: "Basic Information",
      icon: FiInfo,
      data: [
        { label: "Title", value: formData.title },
        { label: "Description", value: formData.description },
        {
          label: formData.propertyType === "rent" ? "Monthly Rent" : "Price",
          value: formatPrice(formData.price),
        },
        ...(formData.propertyType === "rent"
          ? [
            {
              label: "Security Deposit",
              value: formatPrice(formData.deposit),
            },
          ]
          : []),
        { label: "Address", value: formData.address },
        { label: "Area/Locality", value: formData.location },
        { label: "City", value: formData.city },
        { label: "State", value: formData.state },
        { label: "Pincode", value: formData.pincode },
      ],
    },
    {
      id: 3,
      title: "Specifications",
      icon: FiSettings,
      data: [
        ...(formData.category === "Residential"
          ? [
            { label: "BHK", value: formData.bhk },
            { label: "Bathrooms", value: formData.bathrooms },
            { label: "Balcony", value: formData.balcony },
            { label: "Furnishing", value: formData.furnishing },
          ]
          : []),
        { label: "Built-up Area", value: formatArea(formData.builtUpArea) },
        { label: "Carpet Area", value: formatArea(formData.carpetArea) },
        {
          label: "Floor",
          value: formData.floor
            ? `${getOrdinalSuffix(formData.floor)} of ${formData.totalFloors}`
            : null,
        },
        {
          label: "Property Age",
          value: formData.age ? `${formData.age} years` : null,
        },
        { label: "Parking", value: formData.parking },
        { label: "Facing", value: formData.facing },
        ...(formData.propertyType !== "rent"
          ? [
            {
              label: "Possession Status",
              value: formData.possessionStatus,
            },
          ]
          : []),
        ...(formData.propertyType === "rent"
          ? [
            {
              label: "Preferred Tenants",
              value: formData.preferredTenants,
            },
            {
              label: "Move-in Period",
              value: formData.availableFrom,
            },
            {
              label: "Maintenance",
              value: formData.maintenance
                ? formData.maintenance.includes("₹")
                  ? formData.maintenance
                  : `₹${formData.maintenance}`
                : null,
            },
          ]
          : []),
      ].filter((item) => item.value),
    },
    {
      id: 4,
      title: "Amenities & Highlights",
      icon: FiCheckCircle,
      data: [
        {
          label: "Society Amenities",
          value:
            getAmenityNames(formData.societyAmenities).join(", ") ||
            "None selected",
        },
        {
          label: "Nearby Places",
          value: formData.nearbyPlaces?.length
            ? `${formData.nearbyPlaces.length} places added`
            : "None added",
        },
        {
          label: "Key Highlights",
          value: formData.highlights?.join(", ") || "None added",
        },
      ],
    },
    {
      id: 5,
      title: "Photos & Videos",
      icon: FiImage,
      data: [],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
      style={{ willChange: "transform" }}
    >
      {/* Enhanced Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-primary to-primary/80 rounded-full mb-4 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiEye className="text-white" size={24} />
        </motion.div>
        <h1 className="text-4xl font-bold text-heading mb-3 bg-linear-to-r from-heading to-heading/80 bg-clip-text">
          Review Your Updates
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Your property updates are ready! Review all details below and update
          when you&apos;re satisfied
        </p>
        <motion.div
          className="mt-4 inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FiCheck size={14} />
          <span>All steps completed successfully</span>
        </motion.div>
      </motion.div>

      {/* Enhanced Property Overview Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-blue-50 border border-primary/20 rounded-2xl p-8 shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/50 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative">
          <div className="flex-mobile-center gap-4 md:gap-0 mb-6">
            <div className="flex-1">
              <motion.h3
                className="text-mobile-title text-heading mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {formData.title || "Property Title"}
              </motion.h3>
              <motion.p
                className="text-mobile-body text-mobile-muted flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <FiMapPin className="mr-2 text-mobile-primary" size={16} />
                {formData.location || "Location"}
              </motion.p>
            </div>
            <motion.div
              className="text-left md:text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-mobile-primary mb-1">
                {formatPrice(formData.price)}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-mobile-primary rounded-mobile text-sm font-medium">
                {getCategoryDisplay(formData.category)}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Quick Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center p-6 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm min-h-[100px] flex flex-col justify-center">
              <motion.div
                className="text-3xl md:text-2xl font-bold text-primary mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {displayImages.length}
              </motion.div>
              <div className="text-base md:text-sm text-muted font-medium">
                Photos
              </div>
            </div>
            <div className="text-center p-6 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm min-h-[100px] flex flex-col justify-center">
              <motion.div
                className="text-3xl md:text-2xl font-bold text-blue-600 mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {displayVideos.length}
              </motion.div>
              <div className="text-base md:text-sm text-muted font-medium">
                Videos
              </div>
            </div>
            <div className="text-center p-6 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm min-h-[100px] flex flex-col justify-center">
              <motion.div
                className="text-3xl md:text-2xl font-bold text-green-600 mb-1"
                whileHover={{ scale: 1.1 }}
              >
                {formData.societyAmenities?.length || 0}
              </motion.div>
              <div className="text-base md:text-sm text-muted font-medium">
                Amenities
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Detailed Sections */}
      <div className="space-y-6">
        {stepSections.map((section) => (
          <motion.div
            key={section.id}
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 md:p-4 border-b border-gray-100 gap-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  <section.icon className="text-gray-600" size={18} />
                </div>
                <h4 className="font-semibold text-heading text-base md:text-base truncate">
                  {section.title}
                </h4>
              </div>
              <button
                onClick={() => onStepChange && onStepChange(section.id)}
                className="flex items-center space-x-2 px-4 py-2 md:px-3 md:py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors min-h-11 touch-manipulation"
              >
                <FiEdit3 size={16} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            </div>

            <div className="p-4">
              {/* Special handling for media section */}
              {section.id === 5 ? (
                <div className="mt-2 space-y-4">
                  {/* Images Section */}
                  {displayImages && displayImages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted mb-2">
                        {displayImages.length} images uploaded
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-2">
                        {displayImages.slice(0, 12).map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity touch-manipulation min-h-[60px] md:min-h-20"
                          >
                            <Image
                              src={image.url || image.src}
                              alt={image.name || `Image ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                              quality={75}
                            />
                          </div>
                        ))}
                        {displayImages.length > 12 && (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-muted font-medium">
                              +{displayImages.length - 12}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Videos Section */}
                  {displayVideos && displayVideos.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted mb-2">
                        {displayVideos.length} videos uploaded
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {displayVideos.map((video, index) => {
                          const videoRef = React.useRef(null);
                          const isPlaying = playingVideoIndex === index;

                          return (
                            <div
                              key={index}
                              className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
                              onClick={(event) =>
                                handleVideoClick(index, videoRef, event)
                              }
                            >
                              <video
                                ref={videoRef}
                                data-video-index={index}
                                src={video.url || video.src}
                                className="w-full h-full object-cover"
                                controls={isPlaying}
                                poster={video.thumbnail}
                                onPlay={() => setPlayingVideoIndex(index)}
                                onPause={() => {
                                  if (playingVideoIndex === index) {
                                    setPlayingVideoIndex(null);
                                  }
                                }}
                              />
                              {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <FiVideo
                                      className="text-gray-800"
                                      size={20}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                Video {index + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Render data for non-media sections
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.data.map((item, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-sm font-medium text-muted mb-1">
                        {item.label}
                      </span>
                      <span className="text-heading font-medium">
                        {item.value || "Not specified"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Terms and Conditions */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-6"
      >
        <div className="flex items-start space-x-4 md:space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 md:w-4 md:h-4 text-primary border-gray-300 rounded focus:ring-primary touch-manipulation"
          />
          <div className="flex-1">
            <label
              htmlFor="terms"
              className="text-base md:text-sm font-medium text-heading cursor-pointer leading-relaxed"
            >
              I agree to the Terms and Conditions
            </label>
            <p className="text-base md:text-sm text-muted mt-2 md:mt-1 leading-relaxed">
              By updating this property on DalalFree, you certify that all
              provided information is accurate, current, and complete. Your
              updated listing will undergo our quality review process before
              becoming visible to verified buyers and real estate professionals
              across our platform.
            </p>
          </div>
        </div>

        {errors.terms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm">{errors.terms}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
