"use client";
import Image from "next/image";
import { FiMapPin, FiHeart, FiEdit3, FiTrash2 } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PropertyCard({
  property,
  showManagementActions = false,
  onEdit,
  onDelete,
  onWishlistClick
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleWishlistClick = (propertyId) => {
    if (status === "unauthenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (onWishlistClick) {
      onWishlistClick(propertyId);
    } else {
      console.log(`Adding property ${propertyId} to wishlist`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price) => {
    // Handle both number and string prices
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price || 'Price not available';
  };

  return (
    <motion.div
      whileHover={{
        y: -5,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      onClick={() =>
        router.push(`/property/${property.slug || property._id}`)
      }
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer"
      style={{ willChange: "transform" }}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={property.images?.[0]?.url || "/images/home-lifestyle.png"}
          alt={property.title}
          fill
          className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border">
          {property.bhk || property.category}
        </span>

        {/* Management Actions */}
        {showManagementActions && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(property);
              }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              title="Edit Property"
            >
              <FiEdit3 className="text-blue-600" size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(property);
              }}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              title="Delete Property"
            >
              <FiTrash2 className="text-red-600" size={16} />
            </button>
          </div>
        )}

        {/* Wishlist button (only if not showing management actions) */}
        {!showManagementActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistClick(property._id || property.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <AiOutlineHeart
              className="text-gray-600 hover:text-red-500 transition-colors"
              size={16}
            />
          </button>
        )}
      </div>

      {/* Status Badge for Management View */}
      {showManagementActions && property.status && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
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
          {property.featured && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          <p className="text-xl font-bold text-gray-900 leading-tight">
            {formatPrice(property.price)}
            {property.propertyType === 'rent' && property.negotiable !== 'No' && '/month'}
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
            {property.bhk && `${property.bhk} • `}
            {property.builtUpArea && `${property.builtUpArea} sq.ft • `}
            {property.furnishing}
          </p>
        </div>

        {/* Location Row */}
        <div className="mb-auto">
          <p className="text-sm text-gray-500 flex items-center gap-1.5 leading-tight">
            <FiMapPin className="flex-shrink-0" size={14} />
            {property.location || `${property.city}, ${property.state}`}
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-5 pt-3 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/property/${property.slug || property._id}`);
            }}
            transition={{ duration: 0.2 }}
            className="w-full bg-primary text-white text-sm font-semibold py-3 px-4 rounded-xl hover:shadow-sm transition-shadow"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}