"use client";

import {
  FiHome,
  FiKey,
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function QuickCategories() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const handleCategoryClick = (action) => {
    switch (action) {
      case "search-buy":
        router.push("/search?tab=buy");
        break;
      case "search-rent":
        router.push("/search?tab=rent");
        break;
      case "post-property":
        if (!session) {
          setLoginPromptOpen(true);
        } else {
          router.push("/user/properties/new");
        }
        break;
      default:
        break;
    }
  };

  const categories = [
    {
      title: "Buy",
      desc: "Explore verified homes for sale",
      icon: <FiHome className="text-xl text-secondary" />,
      action: "search-buy",
    },
    {
      title: "Rent",
      desc: "Find houses, flats and PGs",
      icon: <FiKey className="text-xl text-secondary" />,
      action: "search-rent",
    },
    {
      title: "Sell",
      desc: "List and reach buyers fast",
      icon: <FiDollarSign className="text-xl text-secondary" />,
      action: "post-property",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Increased stagger for smoother feel
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 }, // Increased initial offset
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6, // Slightly longer for smoother feel
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth feel
      },
    },
  };

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-2xl sm:text-3xl font-bold text-heading mb-8"
        >
          Quick Categories
        </motion.h2>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Reduced amount for earlier trigger
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {categories.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{
                y: -2, // Reduced movement for smoother feel
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
              onClick={() => handleCategoryClick(item.action)}
              className="group flex items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md px-5 py-5 cursor-pointer"
              style={{ willChange: "transform" }} // Performance hint
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-50 transition-colors duration-200">
                  <motion.div
                    whileHover={{ scale: 1.05 }} // Reduced scale for smoother feel
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>

              <motion.div
                whileHover={{ x: 3 }} // Reduced movement
                transition={{
                  type: "spring",
                  stiffness: 400, // Reduced stiffness for smoother spring
                  damping: 25,
                }}
              >
                <FiChevronRight className="text-gray-400 group-hover:text-primary transition-colors duration-200" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Login Prompt Popup */}
      <AnimatePresence>
        {loginPromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
            onClick={() => setLoginPromptOpen(false)}
          >
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.2 },
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.2 },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Join Dalal Free
                  </h3>
                  <button
                    onClick={() => setLoginPromptOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close popup"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Create your account to start buying and selling properties
                  today!
                </p>
              </div>

              {/* Features */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiPlus className="text-primary" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        List Your Property
                      </h4>
                      <p className="text-sm text-gray-600">
                        Reach thousands of verified buyers across the platform.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiSearch className="text-primary" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Find Your Dream Home
                      </h4>
                      <p className="text-sm text-gray-600">
                        Browse from hundreds of verified property listings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiSettings className="text-primary" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Access Premium Tools
                      </h4>
                      <p className="text-sm text-gray-600">
                        Use advanced buyer inquiry and property management
                        tools.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Free to Start:</strong> Register now and get started
                    immediately. No charges for listing or browsing properties!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => setLoginPromptOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      setLoginPromptOpen(false);
                      signIn();
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
