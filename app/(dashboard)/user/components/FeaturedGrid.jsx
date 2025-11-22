"use client";

import Image from "next/image";
import { FiMapPin, FiHeart, FiCheck } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function FeaturedGrid() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleWishlistClick = (propertyId) => {
    if (status === "unauthenticated") {
      // Redirect to login with callback URL
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    // TODO: Add property to wishlist functionality
    console.log(`Adding property ${propertyId} to wishlist`);
    // You could show a toast notification here
  };

  const properties = [
    {
      id: 1,
      price: "₹95 Lakh",
      title: "Green Heights, Baner",
      location: "Pune, Maharashtra",
      bhk: "2BHK",
      size: "1,200",
      furnishing: "Semi-furnished",
      verified: true,
      noBrokerage: true,
      image: "/images/home-lifestyle.png",
      ownerListing: true,
    },
    {
      id: 2,
      price: "₹45,000/mo",
      title: "Skyline Residency, HSR",
      location: "Bengaluru, Karnataka",
      bhk: "3BHK",
      size: "1,350",
      furnishing: "Fully-furnished",
      verified: false,
      noBrokerage: false,
      image: "/images/home-lifestyle.png",
      ownerListing: false,
    },
    {
      id: 3,
      price: "₹1.2 Lakh/mo",
      title: "Grade-A Space, Cybercity",
      location: "Gurgaon, Haryana",
      bhk: "Office",
      size: "3,000",
      furnishing: "Bare shell",
      verified: true,
      noBrokerage: true,
      image: "/images/home-lifestyle.png",
      ownerListing: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-2xl sm:text-3xl font-bold text-heading mb-4 sm:mb-0"
          >
            Featured Properties
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/search?tab=buy&featured=true")}
            className="bg-primary text-white font-medium text-sm px-6 py-2 rounded-full hover:opacity-90"
            suppressHydrationWarning
          >
            View All
          </motion.button>
        </div>

        {/* Property Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {properties.map((property) => (
            <motion.div
              key={property.id}
              variants={cardVariants}
              whileHover={{
                y: -5,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              onClick={() => router.push(`/property/${property.id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer"
              style={{ willChange: "transform" }}
            >
              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.3,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border"
                >
                  {property.bhk}
                </motion.span>
                {/* Heart icon for saving */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleWishlistClick(property.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <AiOutlineHeart
                    className="text-gray-600 hover:text-red-500 transition-colors"
                    size={16}
                  />
                </motion.button>
              </div>
              {/* Bottom ribbon for Owner Listing */}
              {property.ownerListing && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-sm z-10">
                  Owner Listing
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* USP Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {property.verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <FaCheck size={10} />
                      Verified
                    </div>
                  )}
                  {property.noBrokerage && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      No Brokerage
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <p className="text-xl font-bold text-gray-900 leading-tight">
                    {property.price}
                  </p>
                </div>

                {/* Society/Project Name */}
                <div className="mb-3">
                  <p className="text-base font-medium text-gray-800 leading-tight">
                    {property.title}
                  </p>
                </div>

                {/* Specs Row */}
                <div className="mb-3">
                  <p className="text-sm text-gray-600 leading-tight">
                    {property.bhk} • {property.size} sq.ft •{" "}
                    {property.furnishing}
                  </p>
                </div>

                {/* Location Row */}
                <div className="mb-auto">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 leading-tight">
                    <FiMapPin className="flex-shrink-0" size={14} />
                    {property.location}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="mt-5 pt-3 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent double navigation
                      router.push(`/property/${property.id}`);
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-primary text-white text-sm font-semibold py-3 px-4 rounded-xl hover:shadow-sm transition-shadow"
                    suppressHydrationWarning
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
