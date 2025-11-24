"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiSettings,
  FiHeart,
  FiSearch,
  FiPlus,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { data: session } = useSession();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle escape key for accessibility
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Get user-specific actions based on role
  const getUserActions = () => {
    if (!session?.user) return [];

    const baseActions = [
      { href: "/profile", label: "Profile", icon: FiUser },
      {
        href: "/wishlist",
        label: "Wishlist",
        icon: FiHeart,
        roles: ["user"],
      },
    ];

    if (session.user.role === "partner") {
      baseActions.push(
        {
          href: "/partner/properties",
          label: "My Properties",
          icon: FiSettings,
        },
        { href: "/partner/post", label: "Add Property", icon: FiPlus }
      );
    }

    if (session.user.role === "admin") {
      baseActions.push({
        href: "/admin",
        label: "Admin Panel",
        icon: FiSettings,
      });
    }

    return baseActions;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  };

  const userDropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-background border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/t-logo2.png"
              alt="Dalal Free"
              width={120}
              height={30}
              className="object-cover"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {["Buy", "Rent", "Sell", "Commercial"].map((item) => (
                <Link
                  key={item}
                  href={
                    item === "Buy"
                      ? "/?mode=buy"
                      : item === "Rent"
                      ? "/?mode=rent"
                      : item === "Sell"
                      ? "/sell"
                      : "/commercial"
                  }
                  className="text-sm text-muted hover:text-secondary"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Right-side actions */}
            <div className="flex items-center gap-6">
              {session?.user?.role !== "user" && (
                <Link
                  href="/partner/post"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:opacity-95 transition-opacity duration-200"
                >
                  <FiPlus className="mr-2" size={16} />
                  Post Property
                </Link>
              )}

              {!session ? (
                <button
                  onClick={() => signIn()}
                  className="flex items-center px-4 py-2 text-sm text-muted hover:text-secondary transition-colors duration-200 rounded-md hover:bg-gray-50"
                >
                  <FiUser className="mr-2" size={16} />
                  Login / Signup
                </button>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(session.user.name)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.name?.split(" ")[0] || "User"}
                      </p>
                      {session.user.role && (
                        <p className="text-xs text-gray-500 capitalize">
                          {session.user.role}
                        </p>
                      )}
                    </div>
                    <FiChevronDown
                      className={`text-gray-400 transition-transform duration-200 ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        variants={userDropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 py-3 z-50"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-semibold">
                              {getInitials(session.user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {session.user.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.user.email}
                              </p>
                              {session.user.role && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary text-white rounded-full capitalize">
                                  {session.user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Profile and User Actions */}
                        <div className="py-2">
                          {/* Role-based user actions */}
                          {getUserActions()
                            .filter(
                              (action) =>
                                !action.roles ||
                                action.roles.includes(session.user.role)
                            )
                            .map((action) => {
                              const IconComponent = action.icon;
                              return (
                                <Link
                                  key={action.href}
                                  href={action.href}
                                  onClick={() => setUserDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                  <IconComponent size={18} />
                                  {action.label}
                                </Link>
                              );
                            })}
                        </div>

                        {/* Logout Section */}
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              signOut();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                          >
                            <FiLogOut size={18} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            {session && (
              <Link
                href="/profile"
                className="w-9 h-9 bg-primary rounded-full flex items-center justify-center mr-2 text-white text-sm font-semibold"
                aria-label="Profile"
              >
                {getInitials(session.user.name)}
              </Link>
            )}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((s) => !s)}
              className="p-2 rounded-md text-secondary touch-manipulation"
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={mobileMenuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden bg-background border-t border-gray-100 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="px-4 py-6 space-y-1">
              {/* User info section for logged in users */}
              {session && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(session.user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                      {session.user.role && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary text-white rounded-full">
                          {session.user.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Main navigation */}
              <nav className="space-y-1" aria-label="Main navigation">
                {["Buy", "Rent", "Sell", "Commercial"].map((item) => (
                  <Link
                    key={item}
                    href={
                      item === "Buy"
                        ? "/?mode=buy"
                        : item === "Rent"
                        ? "/?mode=rent"
                        : item === "Sell"
                        ? "/sell"
                        : "/commercial"
                    }
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-3 text-base text-secondary font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
                  >
                    {item === "Buy" && <FiSearch className="mr-3" size={20} />}
                    {item === "Rent" && <FiSearch className="mr-3" size={20} />}
                    {item === "Sell" && <FiPlus className="mr-3" size={20} />}
                    {item === "Commercial" && (
                      <FiSettings className="mr-3" size={20} />
                    )}
                    {item}
                  </Link>
                ))}
              </nav>

              {/* Action buttons */}
              {session?.user?.role !== "user" && (
                <div className="pt-4">
                  <Link
                    href="/partner/post"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors duration-150 touch-manipulation"
                  >
                    <FiPlus className="mr-2" size={20} />
                    Post Property
                  </Link>
                </div>
              )}

              {/* User actions */}
              <div className="pt-4 border-t border-gray-100">
                {!session ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      signIn();
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-secondary font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
                  >
                    <FiUser className="mr-2" size={20} />
                    Login / Signup
                  </button>
                ) : (
                  <div className="space-y-1">
                    {/* User-specific actions */}
                    {getUserActions()
                      .filter(
                        (action) =>
                          !action.roles ||
                          action.roles.includes(session.user.role)
                      )
                      .map((action) => {
                        const IconComponent = action.icon;
                        return (
                          <Link
                            key={action.href}
                            href={action.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center px-3 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
                          >
                            <IconComponent className="mr-3" size={18} />
                            {action.label}
                          </Link>
                        );
                      })}

                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                      className="flex items-center w-full px-3 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-150 touch-manipulation"
                    >
                      <FiLogOut className="mr-3" size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
