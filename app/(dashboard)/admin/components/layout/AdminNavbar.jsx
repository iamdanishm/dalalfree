"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiUser,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AdminNavbar({ onMenuClick }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();

  useEffect(() => {
    function handleClickOutside(event) {
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

          {/* Right side - User menu */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <div className="w-8 h-8 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium">
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
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft border border-border overflow-hidden z-100"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-linear-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium">
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

                    <div className="border-t border-border pt-2">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
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