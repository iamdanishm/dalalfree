"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowLeft,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiCalendar,
  FiHome,
  FiMap,
  FiCoffee,
  FiThumbsUp,
  FiShoppingCart,
  FiAward,
  FiShield,
  FiTrendingUp,
  FiClock,
  FiDroplet,
  FiGrid,
  FiCompass,
  FiArrowUp,
  FiTruck,
} from "react-icons/fi";
import {
  FaCheck,
  FaSchool,
  FaHospital,
  FaShoppingBag,
  FaBus,
  FaSubway,
  FaRoad,
  FaGraduationCap,
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PropertyDetails({ params }) {
  const { id } = params;
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState("all");
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showDescriptionMore, setShowDescriptionMore] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const { status } = useSession();
  const router = useRouter();

  const handleWishlistClick = () => {
    if (status === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    setIsWishlisted(!isWishlisted);
    // TODO: Add API call to save/unsave property
  };

  const handleImageNavigation = (direction) => {
    if (direction === "prev") {
      setActiveImage((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else {
      setActiveImage((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleModalImageNavigation = (direction) => {
    if (direction === "prev") {
      setModalImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else {
      setModalImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const openGalleryModal = (startIndex = 0) => {
    setModalImageIndex(startIndex);
    setShowGalleryModal(true);
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setShowGalleryModal(false);
    document.body.style.overflow = "auto";
  };

  const handleKeyDown = (e) => {
    if (!showGalleryModal) return;

    if (e.key === "ArrowLeft") {
      handleModalImageNavigation("prev");
    } else if (e.key === "ArrowRight") {
      handleModalImageNavigation("next");
    } else if (e.key === "Escape") {
      closeGalleryModal();
    }
  };

  // Add keyboard event listener and handle scroll lock
  React.useEffect(() => {
    if (showGalleryModal) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent scroll when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "auto";
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showGalleryModal, modalImageIndex]);

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
          "/images/hero-image.png",
          "/images/home-lifestyle.png",
          "/images/hero-image3.png",
          "/images/hero-image2.png",
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

  const handleContactClick = () => {
    if (status === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    // Contact functionality would go here
    alert("Contact functionality would be implemented here");
  };

  // Generate consistent, compact aspect ratios for uniform grid layout (avoiding staircase effect)
  const imageAspectRatios = useMemo(() => {
    // Use wide aspect ratio for all images to keep grid height compact
    const unifiedRatio = "3/2"; // 1.5:1 ratio - wider format for smaller height
    return property.images.map(() => unifiedRatio);
  }, [property.images]); // Only regenerate when images change

  // Breakpoint columns for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center py-1 text-xs">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-500">Properties</span>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {property.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Property Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-lg border border-blue-100 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {property.score} Grade Property
                  </div>
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    KYC Verified
                  </div>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600">
                  <FiMapPin className="mr-1" size={16} />
                  <span>{property.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Previous Property Navigation */}
                {parseInt(id) > 1 && (
                  <button
                    onClick={() => router.push(`/property/${parseInt(id) - 1}`)}
                    className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200"
                  >
                    <FiChevronLeft size={18} />
                    Previous Property
                  </button>
                )}

                {/* Next Property Navigation */}
                {parseInt(id) < 10 && ( // Assuming there are 10 properties for now
                  <button
                    onClick={() => router.push(`/property/${parseInt(id) + 1}`)}
                    className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200"
                  >
                    Next Property
                    <FiChevronRight size={18} />
                  </button>
                )}

                <div className="text-right">
                  <div className="text-2xl lg:text-3xl font-bold text-green-600">
                    {property.price}
                  </div>
                  <div className="text-sm text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full mt-1">
                    Negotiable Price
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Property Gallery
              </h2>
              <p className="text-gray-600 text-sm">
                {property.images.length} photos
              </p>
            </div>

            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {property.images
                .slice(0, showAllImages ? property.images.length : 6)
                .map((image, index) => (
                  <div key={index}>
                    <div
                      className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-200 mb-4"
                      style={{
                        aspectRatio: imageAspectRatios[index],
                      }}
                      onClick={() => openGalleryModal(index)}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} - ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 mx-auto">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                          <div className="text-sm font-medium">View Image</div>
                        </div>
                      </div>
                      {index ===
                        (showAllImages ? property.images.length : 6) - 1 &&
                        !showAllImages &&
                        property.images.length > 6 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              openGalleryModal(
                                (showAllImages ? property.images.length : 6) - 1
                              );
                            }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-colors"
                          >
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                +{property.images.length - 6}
                              </div>
                              <div className="text-sm">More photos</div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
            </Masonry>
          </div>

          {/* Quick Overview Card */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <FiHome className="mx-auto text-blue-600 mb-2" size={24} />
                <div className="font-semibold text-gray-900 text-sm">
                  {property.specs.bhk}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <FiDroplet className="mx-auto text-green-600 mb-2" size={24} />
                <div className="font-semibold text-gray-900 text-sm">
                  {property.specs.bathrooms} Baths
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <FiTrendingUp
                  className="mx-auto text-purple-600 mb-2"
                  size={24}
                />
                <div className="font-semibold text-gray-900 text-sm">
                  {property.specs.furnishing}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <FiClock className="mx-auto text-orange-600 mb-2" size={24} />
                <div className="font-semibold text-gray-900 text-sm">
                  Ready to Move
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Highlights */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiThumbsUp className="mr-2 text-green-600" />
                  Property Highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <FaCheck
                        className="mr-2 text-green-500 flex-shrink-0"
                        size={14}
                      />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Amenities
                  </h3>
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {showAllAmenities
                      ? "Show Less"
                      : `+${property.amenities.society.length - 6} more`}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.society
                    .slice(
                      0,
                      showAllAmenities ? property.amenities.society.length : 6
                    )
                    .map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <amenity.icon
                          className={`mr-2 flex-shrink-0 ${
                            amenity.available
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                          size={16}
                        />
                        <span
                          className={
                            amenity.available
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          {amenity.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Detailed Property Overview */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Property Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiCalendar className="mr-3 text-blue-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Age of Building
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">2 years</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiHome className="mr-3 text-green-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Ownership Type
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      Self Owned
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiTrendingUp
                        className="mr-3 text-purple-600"
                        size={20}
                      />
                      <span className="text-gray-700 font-medium">
                        Maintenance Charges
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹7,000 per sq.ft/m
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiAward className="mr-3 text-orange-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Flooring
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      Vitrified Tiles
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiMap className="mr-3 text-red-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Built-up Area
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      1,200 sq.ft
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiMapPin className="mr-3 text-indigo-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Carpet Area
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      905 sq.ft
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiShield className="mr-3 text-cyan-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Furnishing Status
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      Unfurnished
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiCoffee className="mr-3 text-brown-600" size={20} />
                      <span className="text-gray-700 font-medium">Facing</span>
                    </div>
                    <span className="font-semibold text-gray-900">East</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiClock className="mr-3 text-teal-600" size={20} />
                      <span className="text-gray-700 font-medium">Floor</span>
                    </div>
                    <span className="font-semibold text-gray-900">14/28</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiThumbsUp className="mr-3 text-yellow-600" size={20} />
                      <span className="text-gray-700 font-medium">Parking</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      Bike and Car
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <FiAward className="mr-3 text-pink-600" size={20} />
                      <span className="text-gray-700 font-medium">
                        Gated Security
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">Yes</span>
                  </div>
                </div>
              </div>

              {/* Location & Neighborhood */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FiMap className="mr-2 text-blue-600" />
                    Location & Neighborhood
                  </h2>
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Walk Score: {property.neighborhood.walkScore}/100
                  </div>
                </div>

                {/* Google Maps Iframe */}
                <div className="mb-6">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <iframe
                      src={`https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      width="100%"
                      height="300"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${property.title} location map`}
                      className="border-0"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {property.location}
                  </p>
                </div>

                <div className="flex items-start mb-4">
                  <FiMapPin
                    className="mr-3 mt-1 text-gray-400 flex-shrink-0"
                    size={20}
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {property.location}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.neighborhood.demographics}
                    </div>
                  </div>
                </div>

                {/* Nearby Amenities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {property.amenities.nearby
                    .slice(0, 3)
                    .map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <amenity.icon
                          className="mr-3 text-gray-600"
                          size={20}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {amenity.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {amenity.distance} away
                          </div>
                        </div>
                        {amenity.rating > 0 && (
                          <div className="flex items-center text-xs">
                            <FiStar
                              className="mr-1 text-yellow-500"
                              size={12}
                            />
                            {amenity.rating}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Commute Times */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Commute Times
                  </h3>
                  <div className="space-y-2">
                    {property.neighborhood.commute.map((commute, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          To {commute.destination}
                        </span>
                        <span className="font-medium">{commute.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* CTA Button */}
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
                <button
                  onClick={handleContactClick}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  {status === "authenticated"
                    ? "View Contact Details / Schedule Visit"
                    : "Login to View Contact / Schedule Visit"}
                </button>
              </div>
            </div>

            {/* Right Column - Owner Info & Amenities */}
            <div className="space-y-6">
              {/* Enhanced Owner Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Owner
                </h3>

                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                    <Image
                      src={property.owner.avatar}
                      alt={property.owner.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {property.owner.name}
                    </h4>
                    <p className="text-green-600 text-sm font-medium">
                      {property.owner.role}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {property.owner.response}
                    </p>
                  </div>
                </div>

                {/* Owner Stats */}
                <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
                  <FiClock className="mx-auto mb-1 text-blue-600" size={18} />
                  <div className="text-sm font-medium text-gray-900">
                    Member since {property.owner.memberSince}
                  </div>
                  <div className="text-xs text-gray-600">
                    {property.owner.response}
                  </div>
                </div>

                {status === "authenticated" ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-3 flex-shrink-0" size={16} />
                      <span className="text-sm">{property.owner.contact}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-3 flex-shrink-0" size={16} />
                      <span className="text-sm">{property.owner.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <FiShield
                      className="mx-auto mb-2 text-gray-400"
                      size={24}
                    />
                    <p className="text-sm text-gray-600">
                      Login to view owner contact details
                    </p>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trust & Safety
                </h3>
                <div className="space-y-3">
                  {property.trustBadges.map((badge, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${badge.bg}`}
                    >
                      <badge.icon className={badge.color} size={18} />
                      <span className={`font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black z-50">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="text-lg font-semibold">{property.title}</div>
              <button
                onClick={closeGalleryModal}
                className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
                aria-label="Close gallery"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                {modalImageIndex > 0 && (
                  <button
                    onClick={() => handleModalImageNavigation("prev")}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
                  </button>
                )}

                {modalImageIndex < property.images.length - 1 && (
                  <button
                    onClick={() => handleModalImageNavigation("next")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
                    aria-label="Next image"
                  >
                    <FiChevronRight className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </>
            )}

            {/* Main Image */}
            <div className="relative max-w-[90vw] max-h-[85vh]">
              <Image
                src={property.images[modalImageIndex]}
                alt={`${property.title} - Photo ${modalImageIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
            {/* Image Counter */}
            <div className="flex justify-center mb-4">
              <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-2 rounded-full">
                <span className="font-semibold">{modalImageIndex + 1}</span>
                <span className="text-white/60 mx-2">/</span>
                <span className="text-white/60">{property.images.length}</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex justify-center">
              <div className="flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-lg bg-black/20 backdrop-blur-sm">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      index === modalImageIndex
                        ? "border-white shadow-lg scale-110"
                        : "border-transparent opacity-70 hover:opacity-100 hover:border-white/50"
                    }`}
                    aria-label={`View photo ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`Photo thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Instructions */}
            <div className="text-center mt-3 text-white/50 text-sm">
              Use ← → keys to navigate • ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
