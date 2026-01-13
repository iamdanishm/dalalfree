"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiEye, FiEdit2, FiMapPin, FiHome, FiDollarSign, FiCalendar, FiAlertTriangle } from "react-icons/fi";

export default function MyProperties({ user, data, onRefresh }) {
  const [properties, setProperties] = useState(data?.properties || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (data?.properties) {
      setProperties(data.properties);
    }
  }, [data]);

  const loadMoreProperties = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await fetch(`/api/users/properties?page=${nextPage}&limit=6`);

      if (response.ok) {
        const result = await response.json();
        if (result.properties && result.properties.length > 0) {
          setProperties(prev => [...prev, ...result.properties]);
          setPage(nextPage);
          setHasMore(result.properties.length === 6); // Assuming limit is 6
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <FiHome size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Properties Yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't posted any properties yet. Start by listing your first property!
        </p>
        <Link
          href="/user/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiEdit2 size={18} />
          Post Your First Property
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property._id || property.slug}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
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
                  <FiHome size={32} className="text-gray-400" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
                  {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                </span>
              </div>

              {/* Property Type Badge - Positioned based on rejection reason */}
              <div className={`absolute top-3 left-3 ${property.status === "rejected" && property.rejectionReason ? 'top-12' : ''}`}>
                <span className="px-3 py-1 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                  {property.propertyType} • {property.category}
                </span>
              </div>

              {/* Rejection Reason Badge */}
              {property.status === "rejected" && property.rejectionReason && (
                <div className="absolute top-3 left-3 bg-red-50 border border-red-200 rounded-lg px-2 py-1 max-w-[200px]">
                  <div className="flex items-center gap-1">
                    <FiAlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
                    <span className="text-xs text-red-800 truncate" title={property.rejectionReason}>
                      {property.rejectionReason}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {property.title}
              </h3>

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

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiCalendar size={12} />
                  <span>Posted {formatDate(property.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/property/${property.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <FiEye size={14} />
                  View
                </Link>
                {property.status !== "rejected" && (
                  <Link
                    href={`/user/properties/edit/${property._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <FiEdit2 size={14} />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <motion.button
            onClick={loadMoreProperties}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Loading..." : "Load More Properties"}
          </motion.button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Need to Post More Properties?</h3>
        <p className="text-gray-600 mb-4">
          Expand your portfolio and reach more potential buyers
        </p>
        <Link
          href="/user/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <FiEdit2 size={18} />
          Post New Property
        </Link>
      </div>
    </div>
  );
}