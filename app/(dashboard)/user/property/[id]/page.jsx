"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiHeart,
} from "react-icons/fi";
import { FaCheck } from "react-icons/fa";

export default function PropertyDetails({ params }) {
  const { id } = params;
  const [activeImage, setActiveImage] = useState(0);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock property data - In production, this would come from an API
  const property = {
    id: id,
    title: "Green Heights, Baner",
    price: "₹95 Lakh",
    originalPrice: "₹1.2 Crore",
    discount: "21% off",
    images: [
      "/images/home-lifestyle.png",
      "/images/home-lifestyle.png",
      "/images/home-lifestyle.png",
    ],
    specs: {
      bhk: "2BHK",
      area: "1,200",
      floor: "3rd of 10",
      age: "2 years old",
      furnishing: "Semi-furnished",
    },
    location: "Baner, Pune, Maharashtra",
    description:
      "Beautiful 2BHK apartment in a prime location with excellent amenities. Close to schools, hospitals, and shopping centers. Perfect for families looking for a comfortable living space.",
    owner: {
      name: "Rajesh Sharma",
      role: "Owner",
      avatar: "/images/home-lifestyle.png",
      contact: "+91 98765 43210",
      email: "rajesh.sharma@example.com",
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
    ],
    details: [
      { label: "Built-up Area", value: "1,200 sq.ft" },
      { label: "Carpet Area", value: "950 sq.ft" },
      { label: "Possession Status", value: "Ready to Move" },
      { label: "Parking", value: "1 Covered Parking" },
      { label: "Facing", value: "North Facing" },
      { label: "Bathrooms", value: "2" },
      { label: "Balcony", value: "2" },
    ],
  };

  const handleContactClick = () => {
    // Contact functionality would go here
    alert("Contact functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Listings Link */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 py-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={16} />
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="relative">
            <div className="aspect-[16/10] relative">
              <Image
                src={property.images[activeImage]}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />

              {/* Trust Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {property.trustBadges.map((badge, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${badge.bg} ${badge.color}`}
                  >
                    <badge.icon size={12} />
                    {badge.label}
                  </div>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${
                  isWishlisted
                    ? "bg-red-100 text-red-600"
                    : "bg-white/90 text-gray-600 hover:text-red-500"
                } transition-colors shadow-sm`}
              >
                <FiHeart
                  size={18}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Image Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 p-4 bg-white border-t">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 ${
                      activeImage === index
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price and Title */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title} (ID: {id})
                  </h1>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {property.price}
                  </div>
                  {property.originalPrice && (
                    <div className="text-lg text-gray-500 line-through">
                      {property.originalPrice}
                      <span className="text-green-600 font-medium ml-2">
                        {property.discount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Ready to Move
                  </span>
                </div>
              </div>

              {/* Specs Row */}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <span className="font-medium">{property.specs.bhk}</span>
                <span>•</span>
                <span>{property.specs.area} sq.ft</span>
                <span>•</span>
                <span>{property.specs.floor}</span>
                <span>•</span>
                <span>{property.specs.furnishing}</span>
                <span>•</span>
                <span>{property.specs.age}</span>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2 flex-shrink-0" size={16} />
                <span>{property.location}</span>
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
                View Contact Details / Enquire Now
              </button>
            </div>
          </div>

          {/* Right Column - Owner Info & Details */}
          <div className="space-y-6">
            {/* Owner Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Owner
              </h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden">
                  <Image
                    src={property.owner.avatar}
                    alt={property.owner.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {property.owner.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{property.owner.role}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-gray-600">
                  <FiPhone className="mr-3 flex-shrink-0" size={16} />
                  <span className="text-sm">{property.owner.contact}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiMail className="mr-3 flex-shrink-0" size={16} />
                  <span className="text-sm">{property.owner.email}</span>
                </div>
              </div>
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

        {/* Additional Details Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Property Details
            </h3>
            {showMoreDetails ? (
              <FiChevronUp size={20} className="text-gray-500" />
            ) : (
              <FiChevronDown size={20} className="text-gray-500" />
            )}
          </button>

          {showMoreDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-600">{detail.label}</span>
                    <span className="font-medium text-gray-900">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
