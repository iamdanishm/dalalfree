"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiHome, FiEdit2 } from "react-icons/fi";
import PropertyCard from "@/app/components/PropertyCard";

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

  const handleEdit = (property) => {
    // Navigate to edit page
    window.location.href = `/user/properties/edit/${property._id}`;
  };

  const handleDelete = async (property) => {
    if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
      try {
        const response = await fetch(`/api/properties/${property._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh the properties list
          if (onRefresh) {
            onRefresh();
          } else {
            // Remove from local state
            setProperties(prev => prev.filter(p => p._id !== property._id));
          }
        } else {
          alert('Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property');
      }
    }
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <PropertyCard
              property={property}
              showManagementActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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