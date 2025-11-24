"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiGift,
  FiCreditCard,
  FiCheck,
  FiStar,
  FiShield,
  FiZap,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";

export default function OnboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect users who aren't logged in
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleChoice = async (choice) => {
    setSelectedOption(choice);
    setIsLoading(true);

    try {
      // TODO: Add analytics tracking
      await fetch("/api/user/onboard-choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, userId: session.user.id }),
      });
    } catch (error) {
      console.error("Error saving choice:", error);
    }

    // Navigate based on choice
    switch (choice) {
      case "ads":
        router.push("/user/dashboard");
        break;
      case "trial":
        router.push("/trial/activate");
        break;
      case "purchase":
        router.push("/purchase/contacts");
        break;
      default:
        router.push("/user/dashboard");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* === Progress Indicator & Welcome Header === */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced Progress Indicator */}
          <div className="inline-flex items-center gap-4 bg-white border-2 border-gray-200 rounded-full px-8 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="text-gray-800 font-semibold text-lg">
                Step 1 of 2
              </span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-bold text-sm">2</span>
              </div>
              <span className="text-gray-500 font-medium">Final Step</span>
            </div>
          </div>

          {/* Welcome Header with User Personalization */}
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="text-xl text-gray-500 max-w-lg mx-auto">
            Choose how you want to access property contacts
          </p>
        </motion.div>
      </div>

      {/* === Clean Option Cards === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === ADS Card === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice("ads")}
            className="relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:border-blue-300 transition-all duration-500 h-full flex flex-col overflow-hidden group"
          >
            {/* Decorative Background Pattern */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <FiPlay className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-gray-900 mb-3"
                  whileHover={{ scale: 1.05 }}
                >
                  Watch Ads
                </motion.h3>
                <p className="text-gray-600 text-base font-medium">
                  Earn credits by watching advertisements
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <motion.div
                    className="text-center mb-6 p-4 bg-white/70 rounded-xl backdrop-blur-sm"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      1 ad = 1 contact
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      Ad-supported access
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiCheck className="w-5 h-5 text-blue-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Short video advertisements
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.1,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <FiCheck className="w-5 h-5 text-blue-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Instant contact access
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.2,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <FiCheck className="w-5 h-5 text-blue-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        No payment required
                      </span>
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedOption === "ads" && isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group mt-6"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  {selectedOption === "ads" && isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Starting...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Watch Ads
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ▶
                      </motion.div>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* === FREE TRIAL Card === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice("trial")}
            className="relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:border-green-300 transition-all duration-500 h-full flex flex-col overflow-hidden group"
          >
            {/* Decorative Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-green-300/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <FiGift className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-gray-900 mb-3"
                  whileHover={{ scale: 1.05 }}
                >
                  Free Trial
                </motion.h3>
                <p className="text-gray-600 text-base font-medium">
                  Start with 30 days free access
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <motion.div
                    className="text-center mb-6 p-4 bg-white/70 rounded-xl backdrop-blur-sm"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      ₹0
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      for 30 days
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiCheck className="w-5 h-5 text-green-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Instant property contacts
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.1,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <FiCheck className="w-5 h-5 text-green-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Direct owner communication
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.2,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <FiCheck className="w-5 h-5 text-green-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Cancel anytime
                      </span>
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedOption === "trial" && isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group mt-6"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  {selectedOption === "trial" && isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Starting...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Start Free Trial
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        →
                      </motion.div>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* === DIRECT PURCHASE Card === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleChoice("purchase")}
            className="relative bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:border-amber-400 transition-all duration-500 h-full flex flex-col overflow-hidden group"
          >
            {/* Most Liked Badge - Fixed Positioning */}
            <div className="absolute -top-4 -left-4 z-20">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-2 rounded-full shadow-xl font-bold text-sm whitespace-nowrap"
              >
                ⭐ Most Liked
              </motion.div>
            </div>

            {/* Decorative Background Pattern */}
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tr from-amber-200/20 to-yellow-300/20 rounded-full translate-y-14 translate-x-14 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.8 }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <FiCreditCard className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-gray-900 mb-3"
                  whileHover={{ scale: 1.05 }}
                >
                  Direct Purchase
                </motion.h3>
                <p className="text-gray-600 text-base font-medium">
                  Get contacts instantly with no commitment
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <motion.div
                    className="text-center mb-6 p-4 bg-white/70 rounded-xl backdrop-blur-sm"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                  >
                    <div className="text-4xl font-bold text-amber-600 mb-2">
                      ₹200
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      30 contacts
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiCheck className="w-5 h-5 text-amber-600" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        30 property contacts
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.1,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <FiCheck className="w-5 h-5 text-amber-600" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Never expires
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        delay: 0.2,
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <FiCheck className="w-5 h-5 text-amber-600" />
                      </motion.div>
                      <span className="text-gray-700 font-medium">
                        Best value per contact
                      </span>
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedOption === "purchase" && isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group mt-6"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  {selectedOption === "purchase" && isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Buy Now
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        💳
                      </motion.div>
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* === Minimal Footer === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-16"
      >
        <p className="text-sm text-gray-400 mb-4">
          Trusted by thousands • Secure payments • 30-day guarantee
        </p>
        <button
          onClick={() => handleChoice("skip")}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          Skip for now
        </button>
      </motion.div>
    </div>
  );
}
