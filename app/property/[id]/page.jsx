"use client";

import { useState } from "react";
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
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PropertyDetails({ params }) {
  const { id } = params;
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState("all");
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center py-3 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Properties
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                {property.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Image Gallery */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 relative">
            <div className="relative aspect-[16/9] bg-gray-900">
              <Image
                src={property.images[activeImage]}
                alt={`${property.title} - ${activeImage + 1}`}
                fill
                className="object-cover"
                priority
              />

              {/* Navigation Arrows */}
              <button
                onClick={() => handleImageNavigation("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleImageNavigation("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <FiChevronRight size={20} />
              </button>

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {activeImage + 1} / {property.images.length}
              </div>

              {/* Property Score & KYC Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {property.score} Grade Property
                </div>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  KYC Verified
                </div>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className={`absolute top-4 right-16 w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isWishlisted
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-gray-600 hover:text-red-500"
                }`}
              >
                <FiHeart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>

              {/* Property Highlights Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">
                      {property.title}
                    </h1>
                    <p className="text-gray-200 text-sm">{property.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {property.price}
                    </div>
                    {property.originalPrice && (
                      <div className="text-sm line-through opacity-75">
                        {property.originalPrice}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 p-4 bg-gray-50 border-t">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === index
                      ? "border-red-500 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-gray-300"
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

              {/* Property Specifications */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Property Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(property.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-600 font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1")}:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {value}
                      </span>
                    </div>
                  ))}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Property Owner
                  </h3>
                  <div className="flex items-center">
                    <FiStar className="mr-1 text-yellow-500" size={14} />
                    <span className="text-sm font-medium">
                      {property.owner.rating}
                    </span>
                  </div>
                </div>

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

              {/* Society Amenities */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Society Amenities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.society.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <amenity.icon
                        className={`mr-2 flex-shrink-0 ${
                          amenity.available ? "text-green-500" : "text-gray-300"
                        }`}
                        size={16}
                      />
                      <span
                        className={
                          amenity.available ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {amenity.name}
                      </span>
                    </div>
                  ))}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
