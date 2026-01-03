"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiPlus, FiSearch, FiSettings, FiX } from "react-icons/fi";

export default function CTASection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const handlePostProperty = () => {
    if (!session) {
      setLoginPromptOpen(true);
    } else if (session.user.role === "partner") {
      router.push("/partner/post");
    } else {
      router.push("/user/properties/new");
    }
  };

  const component = (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-primary text-primary-foreground py-4 md:py-7"
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <motion.h3
          variants={itemVariants}
          className="text-2xl font-semibold text-center md:text-left"
        >
          Start Listing Your Property for Free
        </motion.h3>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={handlePostProperty}
          className="bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-50"
          suppressHydrationWarning
        >
          Post Property Now
        </motion.button>
      </div>
    </motion.section>
  );

  return (
    <>
      {component}

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
    </>
  );
}
