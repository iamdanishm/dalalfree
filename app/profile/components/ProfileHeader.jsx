"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiEdit2,
  FiCheck,
  FiShield,
  FiCalendar,
  FiMail,
} from "react-icons/fi";

export default function ProfileHeader({ user, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      onProfileUpdate(); // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      className="relative bg-gradient-to-r from-primary via-primary to-primary/80 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
      </div>

      <div className="relative p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
              {getInitials(user?.name)}
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                {user?.name || "Welcome!"}
              </h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <FiMail size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate">{user?.email}</span>
                  {user?.isVerified && (
                    <motion.div
                      className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiCheck size={10} />
                      <span className="hidden xs:inline">Verified</span>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FiShield size={14} className="flex-shrink-0" />
                  <span className="text-sm">
                    KYC {user?.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            className="flex flex-col gap-2 sm:flex-row sm:gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 transition-all duration-200 text-sm"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiEdit2 size={14} />
              <span className="sm:inline">Edit Profile</span>
            </motion.button>

            <motion.button
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 text-sm"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiCalendar size={14} />
              <span className="sm:inline">Member since</span>
              <span className="sm:hidden">Since</span>{" "}
              {user?.createdAt
                ? new Date(user.createdAt).getFullYear()
                : "2024"}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Edit Modal - Transforms into white card */}
      {isEditing && (
        <motion.div
          className="bg-white rounded-t-lg mt-2 p-6 shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Profile Information
            </h3>

            {/* Quick Edit Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Edit Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>

              <motion.button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
