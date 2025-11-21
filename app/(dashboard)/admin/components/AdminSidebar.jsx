"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
  FiBarChart,
  FiSettings,
  FiFileText,
  FiX,
  FiDollarSign,
  FiAward,
} from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: FiHome },
  { name: "Users", href: "/admin/users", icon: FiUsers },
  { name: "Properties", href: "/admin/properties", icon: FiMapPin },
  { name: "KYC", href: "/admin/kyc", icon: FiCheckCircle },
  { name: "Analytics", href: "/admin/analytics", icon: FiBarChart },
  { name: "Reports", href: "/admin/reports", icon: FiFileText },
  { name: "Settings", href: "/admin/settings", icon: FiSettings },
];

const quickStats = [
  {
    name: "Revenue Today",
    value: "$2,450",
    icon: FiDollarSign,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Active Properties",
    value: "156",
    icon: FiMapPin,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Pending KYC",
    value: "8",
    icon: FiAward,
    color: "from-orange-500 to-amber-600",
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [activeStat, setActiveStat] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Branding Header */}
      <motion.div
        className="px-4 py-4 border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <h2 className="text-base font-semibold text-heading">
            Dalal Free Admin
          </h2>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="px-4 py-4">
        <motion.div
          className="space-y-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-body hover:bg-surface hover:text-heading hover:shadow-md"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 w-5 h-5 ${
                        isActive
                          ? "text-primary"
                          : "text-muted group-hover:text-heading"
                      }`}
                    />
                  </motion.div>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="mt-3 space-y-2">
            <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-body hover:bg-surface rounded-xl transition-colors">
              <FiUsers className="mr-3 w-4 h-4" />
              Add New User
            </button>
            <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-body hover:bg-surface rounded-xl transition-colors">
              <FiMapPin className="mr-3 w-4 h-4" />
              Approve Property
            </button>
            <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-body hover:bg-surface rounded-xl transition-colors">
              <FiCheckCircle className="mr-3 w-4 h-4" />
              Review KYC
            </button>
          </div>
        </div>

        {/* Quick Stats
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">
            Quick Stats
          </h3>
          <div className="mt-3 space-y-3">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative px-3 py-3 rounded-xl bg-gradient-to-r ${stat.color} transform hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden`}
                onMouseEnter={() => setActiveStat(index)}
                onMouseLeave={() => setActiveStat(null)}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-white/20 mr-3">
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90">
                        {stat.name}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                    <span className="text-xs text-white">↗</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div> */}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted text-center">Dalal Free Admin</div>
      </div>
    </motion.div>
  );
}
