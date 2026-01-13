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
import ProfileEditModal from "./ProfileEditModal";

export default function ProfileHeader({ user, onProfileUpdate }) {
  const [showEditModal, setShowEditModal] = useState(false);

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

  return (
    <motion.div
      className="relative bg-linear-to-r from-primary via-primary to-primary/80 rounded-xl shadow-lg overflow-hidden"
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
            className="shrink-0"
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
                  <FiMail size={14} className="shrink-0" />
                  <span className="text-sm truncate">{user?.email}</span>
                  {user?.isVerified && (
                    <motion.div
                      className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiCheck size={10} />
                      <span className="hidden xs:inline">Verified</span>
                    </motion.div>
                  )}
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
              onClick={() => setShowEditModal(true)}
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onProfileUpdate={onProfileUpdate}
      />
    </motion.div>
  );
}