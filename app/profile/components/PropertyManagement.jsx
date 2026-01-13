"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MyProperties from "./MyProperties";
import WishlistSection from "./WishlistSection";
import ContactHistory from "./ContactHistory";

export default function PropertyManagement({ user }) {
  const [activeTab, setActiveTab] = useState("my-properties");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    properties: [],
    favorites: { favorites: [], totalCount: 0 },
    contacts: { contacts: [], totalCount: 0 }
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel for better performance
      const [propertiesRes, favoritesRes, contactsRes] = await Promise.allSettled([
        fetch("/api/users/properties?limit=6"), // Get first 6 properties for overview
        fetch("/api/users/favorites?page=1&limit=6"), // Get first 6 favorites
        fetch("/api/users/contact-history?page=1&limit=6") // Get first 6 contacts
      ]);

      const newData = {};

      // Handle properties response
      if (propertiesRes.status === "fulfilled" && propertiesRes.value.ok) {
        const propertiesData = await propertiesRes.value.json();
        newData.properties = propertiesData.properties || [];
      } else {
        console.warn("Failed to fetch user properties");
        newData.properties = [];
      }

      // Handle favorites response
      if (favoritesRes.status === "fulfilled" && favoritesRes.value.ok) {
        const favoritesData = await favoritesRes.value.json();
        newData.favorites = {
          favorites: favoritesData.favorites || [],
          totalCount: favoritesData.totalCount || 0
        };
      } else {
        console.warn("Failed to fetch user favorites");
        newData.favorites = { favorites: [], totalCount: 0 };
      }

      // Handle contacts response
      if (contactsRes.status === "fulfilled" && contactsRes.value.ok) {
        const contactsData = await contactsRes.value.json();
        newData.contacts = {
          contacts: contactsData.contacts || [],
          totalCount: contactsData.totalCount || 0
        };
      } else {
        console.warn("Failed to fetch contact history");
        newData.contacts = { contacts: [], totalCount: 0 };
      }

      setData(newData);
    } catch (err) {
      console.error("Error fetching property management data:", err);
      setError("Failed to load property data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "my-properties",
      label: "My Properties",
      count: data.properties.length,
      component: MyProperties
    },
    {
      id: "wishlist",
      label: "Wishlist",
      count: data.favorites.totalCount,
      component: WishlistSection
    },
    {
      id: "contact-history",
      label: "Contact History",
      count: data.contacts.totalCount,
      component: ContactHistory
    }
  ];

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-200">
          <div className="h-6 bg-blue-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
        </div>

        {/* Content skeleton */}
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-red-50 to-red-50 px-6 py-5 border-b border-red-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Property Management
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-200">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Property Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your properties, wishlist, and contact history
          </p>
        </motion.div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent
            user={user}
            data={data}
            onRefresh={fetchAllData}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}