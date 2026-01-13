"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPlay,
  FiGift,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiPlus,
} from "react-icons/fi";

export default function SubscriptionDashboard({ user }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const getSubscriptionData = () => {
    return {
      subscriptionStatus: user?.subscription?.status || "none",
      subscriptionStartDate: user?.subscription?.startDate,
      subscriptionEndDate: user?.subscription?.endDate,
      freeTrialUsed: user?.subscription?.freeTrialUsed || false,
      freeTrialStartDate: user?.subscription?.freeTrialStartDate,
      freeTrialEndDate: user?.subscription?.freeTrialEndDate,
      adUnlockCredits: user?.subscription?.adUnlockCredits || 0,
    };
  };

  const subscriptionData = getSubscriptionData();

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "free_trial":
        return "bg-blue-100 text-blue-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Premium";
      case "free_trial":
        return "Free Trial";
      case "expired":
        return "Expired";
      case "none":
        return "Free";
      default:
        return "Free";
    }
  };

  const calculateTrialDaysLeft = () => {
    if (!subscriptionData.freeTrialEndDate) return 0;
    const now = new Date();
    const endDate = new Date(subscriptionData.freeTrialEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const trialDaysLeft = calculateTrialDaysLeft();

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-green-200">
        <div className="flex items-center justify-between">
          <motion.h2
            className="text-xl font-semibold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Subscription & Credits
          </motion.h2>
          {subscriptionData.subscriptionStatus === "free_trial" && (
            <motion.div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                subscriptionData.subscriptionStatus
              )}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              {trialDaysLeft} days left
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Premium Subscription Showcase */}
        <motion.div
          className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  {subscriptionData.subscriptionStatus ===
                  "free_trial" ? (
                    <FiGift size={24} />
                  ) : subscriptionData.subscriptionStatus === "active" ? (
                    <FiTrendingUp size={24} />
                  ) : (
                    <FiPlay size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {subscriptionData.subscriptionStatus === "free_trial"
                      ? "Free Trial Active"
                      : subscriptionData.subscriptionStatus === "active"
                      ? "Premium Membership"
                      : "Ad-Supported Access"}
                  </h3>
                  <p className="text-purple-100">
                    {subscriptionData.subscriptionStatus === "free_trial"
                      ? "Unlimited contacts for 30 days"
                      : subscriptionData.subscriptionStatus === "active"
                      ? "Full access to premium features"
                      : "Watch ads to reveal contacts"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {subscriptionData.subscriptionStatus === "free_trial"
                    ? `${trialDaysLeft} days`
                    : subscriptionData.subscriptionStatus === "active"
                    ? "Active"
                    : "Free"}
                </div>
                {subscriptionData.subscriptionStatus === "free_trial" && (
                  <div className="text-sm text-purple-200">trial remaining</div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <div
                className={`w-2 h-2 rounded-full ${
                  subscriptionData.subscriptionStatus === "active"
                    ? "bg-green-400"
                    : subscriptionData.subscriptionStatus === "free_trial"
                    ? "bg-blue-400"
                    : "bg-orange-400"
                }`}
              ></div>
              <span className="text-sm font-medium">
                {subscriptionData.subscriptionStatus === "active"
                  ? "Premium Plan"
                  : subscriptionData.subscriptionStatus === "free_trial"
                  ? "30-Day Free Trial"
                  : "Ad-Supported"}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Contact Credits Card - Left Side */}
          <motion.div
            className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-4 md:p-6 text-white relative overflow-hidden group col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <motion.div
                  className="inline-flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <FiZap size={20} />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-white">Credits</h3>
                    <p className="text-emerald-100 text-sm">
                      Property contacts
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="text-7xl font-black text-white mb-2 drop-shadow-lg"
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                >
                  {subscriptionData.adUnlockCredits}
                </motion.div>

                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <p className="text-emerald-100 text-sm font-medium">
                    Available to use
                  </p>
                  <p className="text-emerald-200/80 text-xs">
                    1 credit = 1 contact reveal
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Plan Details Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 col-span-1 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ y: -6, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg"
                whileHover={{ rotate: -5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FiCreditCard className="text-white" size={24} />
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Plan Details
                </h3>
                <p className="text-sm text-gray-600">
                  {subscriptionData.subscriptionStatus === "active"
                    ? "Your premium subscription details"
                    : subscriptionData.subscriptionStatus === "free_trial"
                    ? "Trial period information"
                    : "Upgrade to unlock premium features"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {subscriptionData.subscriptionStatus === "free_trial" && (
                <>
                  <motion.div
                    className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-gray-600">Trial started:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionData.freeTrialStartDate)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <span className="text-gray-600">Trial expires:</span>
                    <span className="font-semibold text-orange-600">
                      {formatDate(subscriptionData.freeTrialEndDate)}
                    </span>
                  </motion.div>
                </>
              )}
              {subscriptionData.subscriptionStatus === "active" && (
                <>
                  <motion.div
                    className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-gray-600">Active since:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionData.subscriptionStartDate)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-100"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionData.subscriptionEndDate)}
                    </span>
                  </motion.div>
                </>
              )}
              {subscriptionData.subscriptionStatus === "none" && (
                <div className="col-span-2 text-center py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="text-4xl mb-3">🚀</div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Upgrade to Premium
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Get unlimited contact reveals and premium features
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Trial Warning */}
        {subscriptionData.subscriptionStatus === "free_trial" &&
          trialDaysLeft <= 3 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FiClock className="text-yellow-500" size={20} />
                <div>
                  <p className="font-medium text-yellow-800">
                    Only {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}{" "}
                    left in your free trial
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Upgrade to premium to continue revealing contact details
                    without interruptions.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Upgrade CTA */}
        {(subscriptionData.subscriptionStatus === "free_trial" ||
          subscriptionData.subscriptionStatus === "none" ||
          subscriptionData.subscriptionStatus === "expired") && (
          <div className="mt-6 text-center">
            {!subscriptionData.freeTrialUsed ? (
              // Show Free Trial button for new users
              <motion.button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2 mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGift size={18} />
                Start Free Trial
              </motion.button>
            ) : (
              // Show Upgrade button for users who have used their trial
              <motion.button
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center gap-2 mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiCreditCard size={18} />
                Upgrade to ₹200 Contact Plan
              </motion.button>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {!subscriptionData.freeTrialUsed
                ? "Get 30 days free trial with unlimited contact reveals"
                : "Get 30 direct contact reveals for ₹200/month"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}