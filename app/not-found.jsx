"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiHome, FiSearch, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants = {
    floating: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl mx-auto"
      >
        {/* 404 Number with Animation */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.div
            variants={floatingVariants}
            animate="floating"
            className="text-8xl md:text-9xl font-bold text-primary opacity-10 select-none"
          >
            404
          </motion.div>
        </motion.div>

        {/* Animated Illustration */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="relative"
          >
            {/* House Illustration */}
            <div className="w-24 h-24 md:w-32 md:h-32 relative">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-primary"
                fill="currentColor"
              >
                {/* House Base */}
                <motion.path
                  d="M20 50 L50 25 L80 50 L80 85 L20 85 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                {/* Door */}
                <motion.rect
                  x="45"
                  y="60"
                  width="10"
                  height="25"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                />
                {/* Windows */}
                <motion.circle
                  cx="30"
                  cy="65"
                  r="3"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                />
                <motion.circle
                  cx="70"
                  cy="65"
                  r="3"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.3 }}
                />
                {/* Smoke */}
                <motion.circle
                  cx="60"
                  cy="15"
                  r="2"
                  fill="currentColor"
                  opacity="0.6"
                  initial={{ y: 0, opacity: 0.6 }}
                  animate={{ y: -15, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <motion.circle
                  cx="65"
                  cy="10"
                  r="1.5"
                  fill="currentColor"
                  opacity="0.4"
                  initial={{ y: 0, opacity: 0.4 }}
                  animate={{ y: -20, opacity: 0 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    delay: 0.5,
                  }}
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-body max-w-lg mx-auto">
            The page you&apos;re looking for seems to have moved or doesn&apos;t
            exist. But don&apos;t worry, let&apos;s get you back to finding your
            perfect property!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-soft hover:opacity-95 transition-opacity"
            >
              <FiHome size={18} />
              Return to Homepage
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-secondary rounded-full font-medium hover:bg-surface transition-colors"
            >
              <FiArrowLeft size={18} />
              Go Back
            </button>
          </motion.div>
        </motion.div>

        {/* Quick Navigation Links */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { name: "Buy Properties", href: "/?mode=buy" },
              { name: "Rent Properties", href: "/?mode=rent" },
              { name: "Sell Property", href: "/sell" },
              { name: "Commercial", href: "/commercial" },
            ].map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="text-muted hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
