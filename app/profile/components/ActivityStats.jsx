"use client";

import { motion } from "framer-motion";
import { FiEye, FiHeart, FiPhone, FiTrendingUp } from "react-icons/fi";

export default function ActivityStats({ user }) {
  // Static data for design purposes - as requested by user
  const staticStats = {
    propertiesViewed: 27,
    contactsRevealed: 8,
    propertiesFavorited: 12,
    totalCreditsUsed: 7,
  };

  const statCards = [
    {
      icon: FiEye,
      label: "Properties Viewed",
      value: staticStats.propertiesViewed,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      description: "This month",
    },
    {
      icon: FiPhone,
      label: "Contacts Revealed",
      value: staticStats.contactsRevealed,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      description: "Using credits",
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: staticStats.propertiesFavorited,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
      description: "Saved properties",
    },
    {
      icon: FiTrendingUp,
      label: "Credits Used",
      value: staticStats.totalCreditsUsed,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      description: "This month",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Activity Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your recent property search and contact activity
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 md:p-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                className={`${stat.bgColor} rounded-lg p-4 border ${stat.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  y: -4,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    className={`p-3 rounded-lg ${stat.iconBg} border border-gray-200 group-hover:scale-110 transition-transform duration-200`}
                    whileHover={{ rotate: 5 }}
                  >
                    <IconComponent
                      className={`${stat.color} group-hover:brightness-110`}
                      size={20}
                    />
                  </motion.div>
                  <div className="text-right">
                    <motion.div
                      className={`text-2xl font-bold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs text-gray-500">
                      {stat.description}
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {stat.label}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              className="flex items-center gap-4 p-4 text-left bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors"
                whileHover={{ rotate: 5 }}
              >
                <FiHeart size={18} />
              </motion.div>
              <div>
                <p className="text-sm font-semibold">View Favorites</p>
                <p className="text-xs opacity-80">Manage saved properties</p>
              </div>
            </motion.button>
            <motion.button
              className="flex items-center gap-4 p-4 text-left bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors"
                whileHover={{ rotate: 5 }}
              >
                <FiPhone size={18} />
              </motion.div>
              <div>
                <p className="text-sm font-semibold">Contact History</p>
                <p className="text-xs opacity-80">
                  Properties you've contacted
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
