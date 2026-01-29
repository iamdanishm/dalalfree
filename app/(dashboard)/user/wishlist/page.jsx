"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiHeart, FiLoader, FiMapPin, FiCheck } from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWishlist } from "@/app/lib/hooks/useWishlist";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [favoritesData, setFavoritesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    toggleWishlist,
    isInWishlist,
    loading: wishlistLoading,
  } = useWishlist();

  const handleWishlistClick = async (propertyId) => {
    if (status === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    await toggleWishlist(propertyId);
  };

  useEffect(() => {
    // Check authentication
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect non-users
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole === "admin") {
        router.push("/admin");
        return;
      }
      if (userRole === "partner") {
        router.push("/partner");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile and favorites in parallel
        const [profileResponse, favoritesResponse] = await Promise.all([
          fetch("/api/users/profile"),
          fetch("/api/users/favorites?page=1&limit=20"),
        ]);

        if (!profileResponse.ok || !favoritesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [profileData, favoritesData] = await Promise.all([
          profileResponse.json(),
          favoritesResponse.json(),
        ]);

        if (profileData.success) {
          setUserProfile(profileData.user);
        }

        if (favoritesData.success) {
          setFavoritesData(favoritesData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  const handleRefresh = async () => {
    // Refetch favorites data
    try {
      const response = await fetch("/api/users/favorites?page=1&limit=20");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFavoritesData(data);
        }
      }
    } catch (error) {
      // Silently handle refresh errors
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // Don't render if wrong role (will redirect)
  if (status === "authenticated" && session?.user?.role !== "user") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <FiHeart className="text-red-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading">
                  My Wishlist
                </h1>
                <p className="text-muted mt-2 text-sm sm:text-base">
                  Your saved property listings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiLoader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted">Loading your saved properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-soft border border-border p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <div className="text-red-500 text-4xl sm:text-5xl lg:text-6xl mb-4">
                Error
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-heading mb-4">
                Error Loading Wishlist
              </h2>
              <p className="text-muted text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 text-sm sm:text-base font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !favoritesData?.favorites ||
          favoritesData.favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">
              <FiHeart size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Your Wishlist is Empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start exploring properties and add them to your wishlist to keep
              track of properties you&apos;re interested in.
            </p>
            <button
              onClick={() => router.push("/search")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-linear-to-r from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FiHeart className="text-pink-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {favoritesData.totalCount} Saved Propert
                    {favoritesData.totalCount !== 1 ? "ies" : "y"}
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {favoritesData.favorites.map((favorite) => {
                const property = favorite.propertyId;
                if (!property) return null;

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
                  image:
                    property.images?.[0]?.url || "/images/home-lifestyle.png",
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
          </div>
        )}
      </div>
    </div>
  );
}