"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiHeart, FiMapPin, FiDollarSign, FiCalendar, FiTrash2, FiExternalLink } from "react-icons/fi";

export default function WishlistSection({ user, data, onRefresh }) {
  const [favorites, setFavorites] = useState(data?.favorites?.favorites || []);
  const [totalCount, setTotalCount] = useState(data?.favorites?.totalCount || 0);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (data?.favorites) {
      setFavorites(data.favorites.favorites || []);
      setTotalCount(data.favorites.totalCount || 0);
    }
  }, [data]);

  const removeFromWishlist = async (propertyId, favoriteId) => {
    if (removingId) return;

    try {
      setRemovingId(favoriteId);
      const response = await fetch(`/api/users/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update local state
        setFavorites(prev => prev.filter(fav => fav._id !== favoriteId));
        setTotalCount(prev => prev - 1);

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
          Start exploring properties and add them to your wishlist to keep track of properties you're interested in.
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
      <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-4 border border-pink-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <FiHeart className="text-pink-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {totalCount} Saved Propert{totalCount !== 1 ? 'ies' : 'y'}
            </h3>
            <p className="text-sm text-gray-600">
              Properties you've saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favorites.map((favorite, index) => {
          const property = favorite.propertyId;
          if (!property) return null;

          return (
            <motion.div
              key={favorite._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(property._id || property.slug, favorite._id)}
                disabled={removingId === favorite._id}
                className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
              >
                <FiTrash2 size={16} />
              </button>

              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FiHeart size={32} className="text-gray-400" />
                  </div>
                )}

                {/* Property Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                    {property.propertyType} • {property.category}
                  </span>
                </div>

                {/* Saved Date */}
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-1 bg-black/60 text-white rounded-full text-xs backdrop-blur-sm">
                    Saved {formatDate(favorite.addedAt)}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <Link href={`/property/${property.slug}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                    {property.title}
                  </h3>
                </Link>

                <div className="space-y-2 mb-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin size={14} />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <FiDollarSign size={14} />
                    <span>{formatPrice(property.price)}</span>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {property.bhk && <span>{property.bhk} BHK</span>}
                    {property.builtUpArea && <span>{property.builtUpArea} sqft</span>}
                  </div>

                  {/* Notes */}
                  {favorite.notes && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <strong>Note:</strong> {favorite.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/property/${property.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <FiExternalLink size={14} />
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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
        <h3 className="font-semibold text-gray-900 mb-2">Find More Properties to Save</h3>
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