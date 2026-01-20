"use client";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import PropertyCard from "@/app/components/PropertyCard";
import { motion } from "framer-motion";
import { useToast } from "@/app/lib/hooks/useToast";

export default function UserPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated but not a regular user or partner, redirect appropriately
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      if (userRole === "admin") {
        router.push("/admin");
        return;
      }
    }
  }, [status, session, router]);

  // Clean up success parameter from URL if present (no need to show toast here since it's already shown during creation)
  useEffect(() => {
    const successParam = searchParams.get("success");
    if (successParam === "true") {
      // Clean up URL by removing the success parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      newSearchParams.delete("propertyId");
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Fetch user properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const response = await fetch(
        `/api/users/properties?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      } else {
        throw new Error(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Handle search with debounce and initial load
  useEffect(() => {
    const debounceTimer = setTimeout(
      () => {
        if (status === "authenticated" && session?.user) {
          fetchProperties();
        }
      },
      searchQuery ? 300 : 0
    ); // No debounce for initial load

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchProperties, status, session]);

  // Handle property edit
  const handleEditProperty = (property) => {
    // Navigate to the edit page
    router.push(`/user/properties/edit/${property.slug || property._id}`);
  };

  // Handle property delete
  const handleDeleteProperty = (property) => {
    // For now, just show a confirmation
    // In the future, this could open a delete confirmation modal
    if (
      window.confirm(`Are you sure you want to delete "${property.title}"?`)
    ) {
      console.log("Delete property:", property._id);
      // TODO: Implement delete functionality
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  // If authenticated but wrong role, don't render anything (will redirect)
  if (
    status === "authenticated" &&
    session?.user &&
    session.user.role === "admin"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading">
              Your Listings
            </h1>
            <p className="text-muted mt-2 text-sm sm:text-base">
              Manage and track all your property listings
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Controls */}
        <div className="bg-white rounded-lg shadow-soft border border-border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <motion.input
                type="text"
                placeholder="Search your properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
              />
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading your properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-soft border border-border p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <div className="text-red-500 text-4xl sm:text-5xl lg:text-6xl mb-4">
                ⚠️
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-heading mb-4">
                Error Loading Properties
              </h2>
              <p className="text-muted text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={fetchProperties}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 text-sm sm:text-base font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="mb-4 sm:mb-6">
              <p className="text-muted text-sm sm:text-base">
                Showing {properties.length} propert
                {properties.length === 1 ? "y" : "ies"}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  showManagementActions={true}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-soft border border-border p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-heading mb-3 sm:mb-4">
                No Properties Found
              </h2>
              <p className="text-muted text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
                {searchQuery.trim()
                  ? `No properties match your search "${searchQuery}". Try adjusting your search terms.`
                  : "You haven't listed any properties yet. Start by creating your first property listing!"}
              </p>
              <button
                onClick={() => router.push("/user/properties/new")}
                className="bg-primary text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 text-sm sm:text-base font-medium"
              >
                List Your First Property
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}