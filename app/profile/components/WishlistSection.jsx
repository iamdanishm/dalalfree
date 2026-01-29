"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiHeart, FiExternalLink, FiMapPin, FiCheck } from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import { useWishlist } from "@/app/lib/hooks/useWishlist";
import { useRouter } from "next/navigation";

export default function WishlistSection({ user, data, onRefresh }) {
  const router = useRouter();
  const {
    toggleWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const [favorites, setFavorites] = useState(data?.favorites?.favorites || []);
  const [totalCount, setTotalCount] = useState(
    data?.favorites?.totalCount || 0,
  );
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (data?.favorites) {
      setFavorites(data.favorites.favorites || []);
      setTotalCount(data.favorites.totalCount || 0);
    }
  }, [data]);

  const handleWishlistClick = async (propertyId) => {
    await toggleWishlist(propertyId);
    // Refresh parent data to update counts
    onRefresh();
  };

  const removeFromWishlist = async (propertyId, favoriteId) => {
    if (removingId) return;

    try {
      setRemovingId(favoriteId);
      const response = await fetch(
        `/api/users/favorites?propertyId=${propertyId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // Update local state
        setFavorites((prev) => prev.filter((fav) => fav._id !== favoriteId));
        setTotalCount((prev) => prev - 1);

        // Refresh parent data
        onRefresh();
      } else {
        console.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Price not set";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <FiHeart size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Your Wishlist is Empty
        </h3>
        <p className="text-gray-600 mb-6">
          Start exploring properties and add them to your wishlist to keep track
          of properties you&apos;re interested in.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiExternalLink size={18} />
          Explore Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-linear-to-r from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <FiHeart className="text-pink-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {totalCount} Saved Propert{totalCount !== 1 ? "ies" : "y"}
            </h3>
            <p className="text-sm text-gray-600">
              Properties you&apos;ve saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Properties Grid - Same design as FeaturedGrid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
      >
        {favorites.map((favorite) => {
          const property = favorite.propertyId;
          if (!property) return null;

          // Transform property data to match FeaturedGrid format exactly
          const transformedProperty = {
            _id: property._id,
            slug: property.slug,
            price: property.price
              ? `₹${property.price.toLocaleString()}`
              : "Price not available",
            title: property.title,
            location:
              property.location || `${property.city}, ${property.state}`,
            bhk: property.category || "N/A", // Use category since bhk is missing
            size: property.builtUpArea?.toString() || "N/A",
            furnishing: property.furnishing || "Not specified",
            verified: property.verified || false,
            noBrokerage: property.noBrokerage || false,
            ownerListing: property.ownerId ? true : false,
            ownerRole: property.ownerId?.role || "user",
            image: property.images?.[0]?.url || "/images/home-lifestyle.png",
          };

          return (
            <motion.div
              key={favorite._id}
              whileHover={{
                y: -5,
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              onClick={() =>
                router.push(
                  `/property/${transformedProperty.slug || transformedProperty._id}`,
                )
              }
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer"
              style={{ willChange: "transform" }}
            >
              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={transformedProperty.image}
                  alt={transformedProperty.title}
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
                  {transformedProperty.bhk}
                </motion.span>
                {/* Heart icon for saving */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleWishlistClick(transformedProperty._id);
                  }}
                  disabled={wishlistLoading}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  {isInWishlist(transformedProperty._id) ? (
                    <AiFillHeart
                      className="text-red-500 transition-colors"
                      size={16}
                    />
                  ) : (
                    <AiOutlineHeart
                      className="text-gray-600 hover:text-red-500 transition-colors"
                      size={16}
                    />
                  )}
                </motion.button>
              </div>
              {/* Bottom ribbon for Owner/Partner Listing */}
              {transformedProperty.ownerListing && (
                <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 ${transformedProperty.ownerRole === "partner" ? "bg-amber-500" : "bg-green-500"} text-white text-xs px-3 py-1 rounded-full shadow-sm z-10`}>
                  {transformedProperty.ownerRole === "partner" ? "Partner Listing" : "Owner Listing"}
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* USP Badges */}
                <div className="flex items-center gap-2 mb-3">
                  {transformedProperty.verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <FaCheck size={10} />
                      Verified
                    </div>
                  )}
                  {transformedProperty.noBrokerage && (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      No Brokerage
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <p className="text-xl font-bold text-gray-900 leading-tight">
                    {transformedProperty.price}
                  </p>
                </div>

                {/* Society/Project Name */}
                <div className="mb-3">
                  <p className="text-base font-medium text-gray-800 leading-tight">
                    {transformedProperty.title}
                  </p>
                </div>

                {/* Location Row */}
                <div className="mb-auto">
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 leading-tight">
                    <FiMapPin className="shrink-0" size={14} />
                    {transformedProperty.location}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="mt-5 pt-3 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent double navigation
                      router.push(
                        `/property/${transformedProperty.slug || transformedProperty._id}`,
                      );
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
          );
        })}
      </motion.div>

      {/* Load More or View All */}
      {totalCount > favorites.length && (
        <div className="text-center pt-6">
          <Link
            href="/user/wishlist"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <FiHeart size={18} />
            View All Saved Properties
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">
          Find More Properties to Save
        </h3>
        <p className="text-gray-600 mb-4">
          Discover new properties that match your preferences
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <FiExternalLink size={18} />
          Search Properties
        </Link>
      </div>
    </div>
  );
}
