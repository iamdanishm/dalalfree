"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiPlay, FiGift, FiCreditCard, FiCheck } from "react-icons/fi";

export default function OnboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Progress Indicator */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4 mb-8 shadow-lg">
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-lg">✓</span>
              </div>
              <span className="text-gray-800 font-bold text-lg">
                Account Created
              </span>
            </motion.div>
            <div className="mx-6 h-0.5 w-12 bg-gradient-to-r from-green-200 to-blue-200"></div>
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <span className="text-gray-900 font-bold text-lg">
                Choose Access Method
              </span>
            </motion.div>
          </div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl animate-pulse">🎯</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-6">
              Welcome{session?.user?.name ? ` ${session.user.name}` : ""}!
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
              <span className="font-semibold text-gray-800">
                Your journey starts here.
              </span>{" "}
              Choose how you want to unlock
              <span className="font-semibold text-blue-600">
                {" "}
                unlimited property contacts
              </span>
            </p>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Secure & Verified</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Instant Access</span>
              </div>
            </div>
          </motion.div>
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
              onClick={() => handleChoice("ads")}
              className="relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FiPlay className="w-10 h-10 text-white" />
                </div>
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
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">Short video ads</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">
                        Instant contact access
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">No payment required</span>
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
              onClick={() => handleChoice("trial")}
              className="relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FiGift className="w-10 h-10 text-white" />
                </div>
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
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Instant property contacts
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">
                        Direct owner communication
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Cancel anytime</span>
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChoice("purchase")}
              className="relative bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
            >
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
                <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FiCreditCard className="w-10 h-10 text-white" />
                </div>
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
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-700">
                        30 property contacts
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-700">Never expires</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                      <FiCheck className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-700">
                        Best value per contact
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
