"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { use } from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiClock,
  FiHeart,
  FiHome,
  FiPhone,
  FiShield,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import {
  FaBus,
  FaCheck,
  FaGraduationCap,
  FaHospital,
  FaShoppingBag,
  FaSubway,
  FaUtensils,
} from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BreadcrumbNavigation from "./components/BreadcrumbNavigation";
import PropertyHeader from "./components/PropertyHeader";
import ImageGallery from "./components/ImageGallery";
import QuickOverview from "./components/QuickOverview";
import PropertyHighlights from "./components/PropertyHighlights";
import AmenitiesComponent from "./components/AmenitiesComponent";
import PropertyDetailsGrid from "./components/PropertyDetailsGrid";
import LocationNeighborhood from "./components/LocationNeighborhood";
import DescriptionComponent from "./components/DescriptionComponent";
import PropertyOwnerCard from "./components/PropertyOwnerCard";
import TrustBadges from "./components/TrustBadges";
import ContactCTA from "./components/ContactCTA";
import GalleryModal from "./components/GalleryModal";

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

export default function PropertyDetails({ params }) {
  const { slug } = use(params);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const { status } = useSession();

  const openGalleryModal = (startIndex = 0) => {
    setModalImageIndex(startIndex);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
  };

  // Transform database property data to frontend format
  const transformPropertyData = (dbProperty) => {
    if (!dbProperty) return null;

    // Map icon strings to React components
    const getIconComponent = (iconString) => {
      const iconMap = {
        FaGraduationCap: FaGraduationCap,
        FaHospital: FaHospital,
        FaShoppingBag: FaShoppingBag,
        FaSubway: FaSubway,
        FaUtensils: FaUtensils,
        FaBus: FaBus,
      };
      return iconMap[iconString] || FiHome; // Default to FiHome if not found
    };

    // Create images array combining images and videos
    const images = [];

    // Add images
    if (dbProperty.images && dbProperty.images.length > 0) {
      dbProperty.images.forEach((img) => {
        images.push({
          src: img.url,
          type: "image",
          category: img.category || "other",
          order: img.order || 0,
        });
      });
    }

    // Add videos
    if (dbProperty.videos && dbProperty.videos.length > 0) {
      dbProperty.videos.forEach((video) => {
        images.push({
          src: video.url,
          type: "video",
          thumbnail:
            dbProperty.images?.[0]?.url || "/images/home-lifestyle.png",
          order: video.order || 0,
        });
      });
    }

    // Sort images by order
    images.sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      id: dbProperty._id,
      title: dbProperty.title,
      subtitle: dbProperty.subtitle,
      price: dbProperty.price
        ? `₹${(dbProperty.price / 100000).toFixed(1)} Lakh`
        : "Price on request",
      originalPrice: dbProperty.originalPrice
        ? `₹${(dbProperty.originalPrice / 100000).toFixed(1)} Lakh`
        : null,
      discount: dbProperty.discount,
      propertyType: dbProperty.category || "Residential",
      verified: dbProperty.verified || false,

      images,
      imageCategories: dbProperty.imageCategories || [],
      specs: {
        bhk: dbProperty.bhk || "N/A",
        area: dbProperty.builtUpArea
          ? `${dbProperty.builtUpArea.toLocaleString()}`
          : "N/A",
        floor: dbProperty.floor
          ? `${getOrdinalSuffix(dbProperty.floor)}${
              dbProperty.totalFloors ? ` of ${dbProperty.totalFloors}` : ""
            }`
          : "N/A",
        age:
          dbProperty.age && dbProperty.ageUnit
            ? `${dbProperty.age} ${dbProperty.ageUnit}`
            : "N/A",
        furnishing: dbProperty.furnishing
          ? dbProperty.furnishing.charAt(0).toUpperCase() +
            dbProperty.furnishing.slice(1)
          : "Unfurnished",
        parking: dbProperty.parking || "No parking",
        bathrooms: dbProperty.bathrooms || "N/A",
        balcony: dbProperty.balcony || "N/A",
      },
      location:
        dbProperty.location ||
        `${dbProperty.city || ""}, ${dbProperty.state || ""}`.trim(),
      coordinates: dbProperty.coordinates || { lat: 0, lng: 0 },
      highlights: dbProperty.highlights || [],
      amenities: {
        society:
          dbProperty.amenities?.society &&
          Array.isArray(dbProperty.amenities.society) &&
          dbProperty.amenities.society.length > 0
            ? dbProperty.amenities.society
                .filter((amenity) => amenity && typeof amenity === "object")
                .map((amenity, index) => {
                  const defaultNames = [
                    "Swimming Pool",
                    "Gym",
                    "24/7 Security",
                    "Power Backup",
                    "Parking",
                    "Garden",
                    "Play Area",
                    "Intercom",
                    "Lift",
                    "Water Supply",
                  ];
                  return {
                    name:
                      amenity.title ||
                      amenity.name ||
                      defaultNames[index] ||
                      "Society Amenity",
                    available:
                      amenity.available !== undefined
                        ? amenity.available
                        : true,
                    image: amenity.image || "/images/home-lifestyle.png",
                  };
                })
            : [
                // Default amenities if none are specified
                {
                  name: "24/7 Security",
                  available: true,
                  image: "/images/home-lifestyle.png",
                },
                {
                  name: "Power Backup",
                  available: true,
                  image: "/images/home-lifestyle.png",
                },
                {
                  name: "Parking",
                  available: true,
                  image: "/images/home-lifestyle.png",
                },
              ],
        nearby: (
          dbProperty.amenities?.nearby ||
          dbProperty.nearbyPlaces ||
          []
        ).map((place) => ({
          name: typeof place.name === "string" ? place.name : "Unknown Place",
          icon: getIconComponent(place.icon || "FaGraduationCap"),
          distance: typeof place.distance === "string" ? place.distance : "N/A",
          rating: typeof place.rating === "number" ? place.rating : 0,
        })),
      },
      description: dbProperty.description || "No description available.",
      owner: {
        name: "Property Owner", // Will need to fetch from User model
        role: "Verified Owner",
        avatar: "/images/home-lifestyle.png",
        contact: "Contact for details",
        email: "contact@example.com",
        rating: 4.5,
        completedDeals: 0,
        memberSince: "2024",
        response: "Responds within 24 hours",
      },
      trustBadges: [
        {
          label: "Verified Listing",
          icon: FaCheck,
          color: "text-green-800",
          bg: "bg-green-100",
        },
      ],
      details: [
        {
          label: "Built-up Area",
          value: dbProperty.builtUpArea
            ? `${dbProperty.builtUpArea.toLocaleString()} sq.ft`
            : "N/A",
        },
        {
          label: "Carpet Area",
          value: dbProperty.carpetArea
            ? `${dbProperty.carpetArea.toLocaleString()} sq.ft`
            : "N/A",
        },
        {
          label: "Possession Status",
          value: dbProperty.possessionStatus
            ? dbProperty.possessionStatus
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : "Ready to Move",
        },
        { label: "Parking", value: dbProperty.parking || "No parking" },
        {
          label: "Facing",
          value: dbProperty.facing
            ? dbProperty.facing.charAt(0).toUpperCase() +
              dbProperty.facing.slice(1)
            : "N/A",
        },
        { label: "Bathrooms", value: dbProperty.bathrooms || "N/A" },
        { label: "Balcony", value: dbProperty.balcony || "N/A" },
        {
          label: "Floor",
          value: dbProperty.floor
            ? `${getOrdinalSuffix(dbProperty.floor)}${
                dbProperty.totalFloors ? ` of ${dbProperty.totalFloors}` : ""
              }`
            : "N/A",
        },
        {
          label: "Age",
          value:
            dbProperty.age && dbProperty.ageUnit
              ? `${dbProperty.age} ${dbProperty.ageUnit}`
              : "N/A",
        },
        { label: "Maintenance", value: dbProperty.maintenance || "N/A" },
      ],
      neighborhood: {
        walkScore: 75,
        livability: "Medium",
        commute: [],
        demographics: "Well-connected area",
      },
    };
  };

  // Fetch property data
  const fetchPropertyBySlug = async (slugParam) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/properties/${encodeURIComponent(slugParam)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.property) {
        const transformedProperty = transformPropertyData(data.property);
        setProperty(transformedProperty);
      } else {
        throw new Error(data.error || "Property not found");
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err.message);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch property on component mount
  useEffect(() => {
    if (slug) {
      fetchPropertyBySlug(slug);
    }
  }, [slug]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-heading mb-4">
              Property Not Found
            </h2>
            <p className="text-muted text-lg mb-8">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Show not found if no property
  if (!property) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-heading mb-4">
              Property Not Found
            </h2>
            <p className="text-muted text-lg mb-8">
              The property you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Browse Properties
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <BreadcrumbNavigation
            propertyTitle={property?.title || "Property Details"}
          />
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Property Information Card */}
          <motion.div variants={itemVariants}>
            <PropertyHeader property={property} id={property.id} />
          </motion.div>

          {/* Image Gallery with Quick Overview Overlay */}
          <motion.div
            className="relative mb-8"
            variants={itemVariants}
            whileHover={hoverVariants.hover}
          >
            <ImageGallery
              property={property}
              showAllImages={false}
              setShowAllImages={() => {}}
              onOpenGalleryModal={openGalleryModal}
            />
            {/* Quick Overview Overlay positioned on bottom half of image */}
            <motion.div
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 w-11/12 max-w-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <QuickOverview specs={property.specs} />
            </motion.div>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              variants={itemVariants}
            >
              {/* Property Highlights */}
              <motion.div
                className="pt-4"
                variants={itemVariants}
                whileHover={hoverVariants.hover}
              >
                <PropertyHighlights highlights={property.highlights} />
              </motion.div>

              {/* Amenities */}
              <motion.div
                variants={itemVariants}
                whileHover={hoverVariants.hover}
              >
                <AmenitiesComponent amenities={property.amenities.society} />
              </motion.div>

              {/* Detailed Property Overview */}
              <motion.div
                variants={itemVariants}
                whileHover={hoverVariants.hover}
              >
                <PropertyDetailsGrid details={property.details} />
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <DescriptionComponent description={property.description} />
              </motion.div>

              {/* Location & Neighborhood */}
              <motion.div
                variants={itemVariants}
                whileHover={hoverVariants.hover}
              >
                <LocationNeighborhood
                  location={property.location}
                  coordinates={property.coordinates}
                  neighborhood={property.neighborhood}
                  amenities={property.amenities.nearby}
                />
              </motion.div>
            </motion.div>

            {/* Right Column - Owner Info & Amenities */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* Enhanced Owner Information */}
              <motion.div
                className="pt-4"
                variants={itemVariants}
                whileHover={hoverVariants.hover}
              >
                <PropertyOwnerCard />
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <TrustBadges />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Gallery Modal */}
      {showGalleryModal && (
        <GalleryModal
          property={property}
          isOpen={showGalleryModal}
          currentIndex={modalImageIndex}
          onClose={closeGalleryModal}
          onNavigate={(direction) => {
            if (direction === "prev") {
              setModalImageIndex((prev) =>
                prev > 0 ? prev - 1 : (property?.images?.length || 1) - 1
              );
            } else if (direction === "next") {
              setModalImageIndex((prev) =>
                prev < (property?.images?.length || 1) - 1 ? prev + 1 : 0
              );
            } else {
              setModalImageIndex(direction);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setModalImageIndex((prev) =>
                prev > 0 ? prev - 1 : (property?.images?.length || 1) - 1
              );
            } else if (e.key === "ArrowRight") {
              setModalImageIndex((prev) =>
                prev < (property?.images?.length || 1) - 1 ? prev + 1 : 0
              );
            } else if (e.key === "Escape") {
              closeGalleryModal();
            }
          }}
        />
      )}
    </>
  );
}
