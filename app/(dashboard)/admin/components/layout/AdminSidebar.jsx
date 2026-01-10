"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiAward,
} from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: FiHome },
  { name: "Users", href: "/admin/users", icon: FiUsers },
  { name: "Properties", href: "/admin/properties", icon: FiMapPin },
  { name: "Amenities", href: "/admin/amenities", icon: FiAward },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

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
      </nav>
    </motion.div>
  );
}
