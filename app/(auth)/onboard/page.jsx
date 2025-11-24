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
  FiUsers,
  FiClock,
  FiLock,
} from "react-icons/fi";

export default function OnboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-lg"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-200/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Compact Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Progress Indicator */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-3 mb-6 shadow-lg">
            <motion.div
              className="flex items-center gap-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black">✓</span>
              </div>
              <span className="text-gray-800 font-bold text-sm">
                Account Created
              </span>
            </motion.div>
            <div className="mx-4 h-0.5 w-8 bg-gradient-to-r from-green-200 to-blue-200"></div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white font-bold">2</span>
              </div>
              <span className="text-gray-900 font-bold text-sm">
                Choose Method
              </span>
            </motion.div>
          </div>

          {/* Compact Welcome Message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-2xl animate-pulse">🎯</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-4">
              Welcome{session?.user?.name ? ` ${session.user.name}` : ""}!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span className="font-semibold">Your journey starts here.</span>{" "}
              Choose how you want to unlock
              <span className="font-semibold text-blue-600">
                {" "}
                unlimited property contacts
              </span>
            </p>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-6 text-sm mt-8"
            >
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-full border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <FiStar className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-700">
                  4.9/5 Rating
                </span>
              </motion.div>

              <motion.div
                className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-full border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <FiShield className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">100% Secure</span>
              </motion.div>

              <motion.div
                className="w-0.5 h-8 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />

              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-full border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <FiZap className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-700">
                  Instant Access
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ADS Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredCard("ads")}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => handleChoice("ads")}
              className="relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={
                    hoveredCard === "ads"
                      ? {
                          scale: [1, 1.15, 1.1, 1.15],
                          rotate: [0, -8, 8, -6, 6, 0],
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                        }
                  }
                  transition={{
                    duration: hoveredCard === "ads" ? 0.8 : 0.1,
                    ease: hoveredCard === "ads" ? "easeInOut" : "linear",
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <motion.div
                    animate={
                      hoveredCard === "ads"
                        ? { scale: 1 }
                        : { scale: [1, 1.1, 1] }
                    }
                    transition={{
                      duration: hoveredCard === "ads" ? 0.1 : 2,
                      repeat: hoveredCard === "ads" ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <FiPlay className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Watch Ads
                </h3>
                <p className="text-gray-600 text-base">
                  Earn credits by watching ads
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6 p-4 bg-white/70 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      1 ad = 1 contact
                    </div>
                    <div className="text-sm text-gray-600">
                      Ad-supported access
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Watch short videos
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiZap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Instant access
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FiLock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Free forever
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  disabled={selectedOption === "ads" && isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl mt-6"
                >
                  {selectedOption === "ads" && isLoading
                    ? "Starting..."
                    : "Watch Ads"}
                </motion.button>
              </div>
            </motion.div>

            {/* FREE TRIAL Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredCard("trial")}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => handleChoice("trial")}
              className="relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={
                    hoveredCard === "trial"
                      ? {
                          scale: [1, 1.2, 1.1],
                          rotate: [0, 10, -10, 5, -5, 0],
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                        }
                  }
                  transition={{
                    duration: hoveredCard === "trial" ? 0.6 : 0.1,
                    ease: hoveredCard === "trial" ? "easeInOut" : "linear",
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <motion.div
                    animate={
                      hoveredCard === "trial"
                        ? { scale: 1 }
                        : { scale: [1, 1.05, 1] }
                    }
                    transition={{
                      duration: hoveredCard === "trial" ? 0.1 : 3,
                      repeat: hoveredCard === "trial" ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <FiGift className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Free Trial
                </h3>
                <p className="text-gray-600 text-base">
                  Start with 30 days free
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6 p-4 bg-white/70 rounded-xl">
                    <div className="text-4xl font-bold text-green-600">₹0</div>
                    <div className="text-sm text-gray-600">for 30 days</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FiUsers className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Property contacts included
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FiZap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Direct communication
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <FiClock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        Cancel any time
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  disabled={selectedOption === "trial" && isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-xl mt-6"
                >
                  {selectedOption === "trial" && isLoading
                    ? "Starting..."
                    : "Start Free Trial"}
                </motion.button>
              </div>
            </motion.div>

            {/* DIRECT PURCHASE Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1.05 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.07 }}
              whileTap={{ scale: 1.03 }}
              onHoverStart={() => setHoveredCard("purchase")}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => handleChoice("purchase")}
              className="relative bg-gradient-to-br from-amber-50 to-yellow-100 border-3 border-amber-300 rounded-2xl p-10 cursor-pointer hover:shadow-3xl transition-all duration-500 h-full flex flex-col"
            >
              {/* Sparkle Animations */}
              <motion.div
                animate={{
                  scale: [0.8, 1.2, 1],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 -right-2 text-yellow-400"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1.1],
                  rotate: [0, -20, 20, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute top-2 -left-2 text-amber-500"
              >
                🌟
              </motion.div>
              <motion.div
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-16 -right-3 text-yellow-500"
              >
                ⭐
              </motion.div>
              <motion.div
                animate={{
                  scale: [1.1, 0.8, 1.1],
                  rotate: [5, -5, 5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="absolute top-20 -left-1 text-amber-400"
              >
                ✨
              </motion.div>

              {/* Most Liked Badge */}
              <div className="absolute -top-4 -left-4 z-20">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.2, type: "spring" }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-2 rounded-full shadow-xl font-bold text-sm"
                >
                  ⭐ Most Liked
                </motion.div>
              </div>

              <div className="text-center mb-8">
                <motion.div
                  animate={
                    hoveredCard === "purchase"
                      ? {
                          scale: [1, 1.2, 1.1, 1.2],
                          y: [0, -5, 0, -5, 0],
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                          x: 0,
                          y: 0,
                        }
                  }
                  transition={{
                    duration: hoveredCard === "purchase" ? 1 : 0.3,
                    ease: hoveredCard === "easeInOut",
                    ...(!hoveredCard && {
                      repeat: Infinity,
                      repeatDelay: 4,
                      repeatType: "reverse",
                    }),
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <motion.div
                    animate={
                      hoveredCard === "purchase"
                        ? { scale: 1, x: 0, y: 0 }
                        : { x: [0, 2, 0, -2, 0], y: [0, -1, 0, 1, 0] }
                    }
                    transition={{
                      duration: hoveredCard === "purchase" ? 0.1 : 4,
                      repeat: hoveredCard === "purchase" ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <FiCreditCard className="w-10 h-10 text-white" />
                  </motion.div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Direct Purchase
                </h3>
                <p className="text-gray-600 text-base">
                  Get contacts instantly
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-6 p-4 bg-white/70 rounded-xl">
                    <div className="text-4xl font-bold text-amber-600">
                      ₹200
                    </div>
                    <div className="text-sm text-gray-600">30 contacts</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:from-yellow-100 hover:to-amber-100 transition-all border border-amber-200/50">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                        <FiUsers className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-semibold">
                        30 premium contacts
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:from-yellow-100 hover:to-amber-100 transition-all border border-amber-200/50">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-400 rounded-full flex items-center justify-center shadow-sm">
                        <FiStar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-semibold">
                        Unlimited access forever
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:from-yellow-100 hover:to-amber-100 transition-all border border-amber-200/50">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-sm">
                        <FiZap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-semibold">
                        Best value guarantee
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  disabled={selectedOption === "purchase" && isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold py-4 px-6 rounded-xl mt-6"
                >
                  {selectedOption === "purchase" && isLoading
                    ? "Processing..."
                    : "Buy Now"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
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
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
