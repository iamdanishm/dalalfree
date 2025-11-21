"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AdminNavbar({ onMenuClick }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const notificationsRef = useRef(null);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: "New user registered",
      description: "John Doe joined the platform",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "Property approved",
      description: "Apartment in Downtown approved",
      time: "15 minutes ago",
      unread: true,
    },
    {
      id: 3,
      title: "KYC pending review",
      description: "Sarah Wilson requires verification",
      time: "1 hour ago",
      unread: false,
    },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userDropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const notificationsVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <motion.header
      className="bg-white/80 backdrop-blur-lg border-b border-border/50"
      initial={{ opacity: 0, y: -70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-between h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Left side - Logo and Mobile menu button */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="transition-transform"
              >
                <Image
                  src="/t-logo2.png"
                  alt="Dalal Free"
                  width={120}
                  height={30}
                  className="object-cover"
                />
              </motion.div>
            </Link>

            <motion.button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-secondary hover:bg-surface transition-colors z-10 relative"
              aria-label="Open sidebar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <FiMenu className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Right side - Notifications and User menu */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-secondary hover:bg-surface transition-colors"
                aria-label="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {notifications.filter((n) => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    variants={notificationsVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-soft border border-border overflow-hidden z-[100] shadow-lg"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="text-sm font-semibold text-heading">
                        Notifications
                      </h3>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors ${
                            notification.unread ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                notification.unread
                                  ? "bg-primary"
                                  : "bg-transparent"
                              }`}
                            />
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-heading">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted/70 mt-2">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 text-center">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-heading">
                  {session?.user?.name || "Admin"}
                </span>
                <FiChevronDown
                  className={`w-4 h-4 text-muted transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    variants={userDropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft border border-border overflow-hidden z-[100] shadow-lg"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium">
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-heading">
                            {session?.user?.name || "Admin"}
                          </p>
                          <p className="text-xs text-muted">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button className="w-full flex items-center px-4 py-3 text-sm text-body hover:bg-surface transition-colors">
                        <FiSettings className="w-4 h-4 mr-3" />
                        Profile Settings
                      </button>
                    </div>

                    <div className="border-t border-border pt-2">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
