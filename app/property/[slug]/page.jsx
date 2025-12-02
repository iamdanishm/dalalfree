"use client";

import React, { useState } from "react";
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

export default function PropertyDetails({ params }) {
  const { id } = use(params);
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

  // Mock property data - In production, this would come from an API
  const getPropertyById = (id) => {
    const allProperties = [
      {
        id: 1,
        title: "Green Heights, Baner",
        subtitle: "Premium 2BHK Apartment",
        price: "₹95 Lakh",
        originalPrice: "₹1.2 Crore",
        discount: "21% off",
        propertyType: "Residential",
        score: "A+",
        images: [
          "/images/home-lifestyle.png",
          "/images/hero-image3.png",
          "/images/hero-image2.png",
          "/images/hero-image1.png",
          { src: "/images/hero-image.png", type: "image" },
          {
            src: "/video/sample.mp4",
            type: "video",
            thumbnail: "/images/home-lifestyle.png",
          },
          { src: "/images/hero-image3.png", type: "image" },
          {
            src: "/video/sample.mp4",
            type: "video",
            thumbnail: "/images/hero-image2.png",
          },
          "/images/hero-image1.png",
        ],
        imageCategories: [
          "Exterior",
          "Living Room",
          "Kitchen",
          "Bedroom",
          "Bathroom",
        ],
        specs: {
          bhk: "2BHK",
          area: "1,200",
          floor: "3rd of 10",
          age: "2 years old",
          furnishing: "Semi-furnished",
          parking: "1 Covered",
          bathrooms: "2",
          balcony: "2",
        },
        location: "Baner, Pune, Maharashtra",
        coordinates: { lat: 18.5642, lng: 73.7769 },
        highlights: [
          "Gated Community with 24/7 Security",
          "Swimming Pool & Gym Facilities",
          "Power Backup & Water Supply",
          "Near to Schools & Metro Station",
          "Vastu Compliant Design",
        ],
        amenities: {
          society: [
            { name: "Swimming Pool", icon: FiHome, available: true },
            { name: "Gym", icon: FiAward, available: true },
            { name: "Children's Play Area", icon: FiStar, available: true },
            { name: "24/7 Security", icon: FiShield, available: true },
            { name: "Power Backup", icon: FiTrendingUp, available: true },
            { name: "Lift", icon: FiClock, available: false },
            { name: "Intercom", icon: FiPhone, available: true },
            { name: "Water Supply", icon: FiHome, available: true },
          ],
          nearby: [
            {
              name: "School",
              icon: FaGraduationCap,
              distance: "0.5 km",
              rating: 4.2,
            },
            {
              name: "Hospital",
              icon: FaHospital,
              distance: "1.2 km",
              rating: 4.5,
            },
            {
              name: "Mall",
              icon: FaShoppingBag,
              distance: "2.1 km",
              rating: 4.0,
            },
            { name: "Metro", icon: FaSubway, distance: "1.8 km", rating: 3.8 },
            { name: "Bus Stop", icon: FaBus, distance: "0.3 km", rating: 0 },
          ],
        },
        description:
          "Beautiful 2BHK apartment in a prime location with excellent amenities. Close to schools, hospitals, and shopping centers. Perfect for families looking for a comfortable living space.",
        owner: {
          name: "Rajesh Sharma",
          role: "Verified Owner",
          avatar: "/images/home-lifestyle.png",
          contact: "+91 98765 43210",
          email: "rajesh.sharma@example.com",
          rating: 4.8,
          completedDeals: 25,
          memberSince: "2019",
          response: "Responds within 2 hours",
        },
        trustBadges: [
          {
            label: "Verified Listing",
            icon: FaCheck,
            color: "text-green-800",
            bg: "bg-green-100",
          },
          {
            label: "No Brokerage",
            icon: FiHeart,
            color: "text-blue-800",
            bg: "bg-blue-100",
          },
          {
            label: "Ready to Move",
            icon: FiHome,
            color: "text-purple-800",
            bg: "bg-purple-100",
          },
        ],
        details: [
          { label: "Built-up Area", value: "1,200 sq.ft" },
          { label: "Carpet Area", value: "950 sq.ft" },
          { label: "Possession Status", value: "Ready to Move" },
          { label: "Parking", value: "1 Covered Parking" },
          { label: "Facing", value: "North Facing" },
          { label: "Bathrooms", value: "2" },
          { label: "Balcony", value: "2" },
          { label: "Floor", value: "3rd of 10" },
          { label: "Age", value: "2 years old" },
          { label: "Maintenance", value: "₹2,500/month" },
        ],
        neighborhood: {
          walkScore: 85,
          livability: "High",
          commute: [
            { destination: "Pune Airport", time: "25 min", distance: "15 km" },
            { destination: "MG Road", time: "15 min", distance: "8 km" },
            { destination: "Wakad IT Park", time: "10 min", distance: "5 km" },
          ],
          demographics: "Family-friendly area with good schools and healthcare",
        },
      },
    ];

    return (
      allProperties.find((prop) => prop.id === parseInt(id)) || allProperties[0]
    );
  };

  const property = getPropertyById(id);

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
          <BreadcrumbNavigation propertyTitle={property.title} />
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Property Information Card */}
          <motion.div variants={itemVariants}>
            <PropertyHeader property={property} id={id} />
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
                prev > 0 ? prev - 1 : property.images.length - 1
              );
            } else if (direction === "next") {
              setModalImageIndex((prev) =>
                prev < property.images.length - 1 ? prev + 1 : 0
              );
            } else {
              setModalImageIndex(direction);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setModalImageIndex((prev) =>
                prev > 0 ? prev - 1 : property.images.length - 1
              );
            } else if (e.key === "ArrowRight") {
              setModalImageIndex((prev) =>
                prev < property.images.length - 1 ? prev + 1 : 0
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
