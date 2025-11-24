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

  const getStaticSubscriptionData = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return {
      subscriptionStatus: user?.subscriptionStatus || "none",
      subscriptionStartDate: user?.subscriptionStartDate || now,
      subscriptionEndDate: user?.subscriptionEndDate || sevenDaysFromNow,
      freeTrialUsed: user?.freeTrialUsed || false,
      freeTrialStartDate: user?.freeTrialStartDate,
      freeTrialEndDate: user?.freeTrialEndDate || thirtyDaysFromNow,
      adUnlockCredits: user?.adUnlockCredits || 0,
    };
  };

  const staticSubscriptionData = getStaticSubscriptionData();

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
    if (!staticSubscriptionData.freeTrialEndDate) return 0;
    const now = new Date();
    const endDate = new Date(staticSubscriptionData.freeTrialEndDate);
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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h2
          className="text-xl font-semibold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Subscription & Credits
        </motion.h2>
        {staticSubscriptionData.subscriptionStatus === "free_trial" && (
          <motion.div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              staticSubscriptionData.subscriptionStatus
            )}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
          >
            {trialDaysLeft} days left
          </motion.div>
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Subscription Status Card */}
        <motion.div
          className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20 hover:shadow-lg transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FiTrendingUp className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Current Plan</h3>
              <p
                className={`text-sm ${getStatusColor(
                  staticSubscriptionData.subscriptionStatus
                )}`}
              >
                {getStatusText(staticSubscriptionData.subscriptionStatus)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {staticSubscriptionData.subscriptionStatus === "free_trial" && (
              <>
                <div className="flex justify-between">
                  <span>Trial started:</span>
                  <span>
                    {formatDate(staticSubscriptionData.freeTrialStartDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trial expires:</span>
                  <span>
                    {formatDate(staticSubscriptionData.freeTrialEndDate)}
                  </span>
                </div>
              </>
            )}
            {staticSubscriptionData.subscriptionStatus === "active" && (
              <>
                <div className="flex justify-between">
                  <span>Active since:</span>
                  <span>
                    {formatDate(staticSubscriptionData.subscriptionStartDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span>
                    {formatDate(staticSubscriptionData.subscriptionEndDate)}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Contact Reveal Credits Card */}
        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-lg transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiZap className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contact Credits</h3>
              <p className="text-sm text-gray-600">Reveal property contacts</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {staticSubscriptionData.adUnlockCredits}
            </div>
            <p className="text-sm text-gray-600">Available Credits</p>
          </div>

          {staticSubscriptionData.adUnlockCredits === 0 &&
            staticSubscriptionData.subscriptionStatus !== "none" && (
              <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <FiPlus size={16} />
                Get More Credits
              </button>
            )}
        </motion.div>
      </motion.div>

      {/* Trial Warning */}
      {staticSubscriptionData.subscriptionStatus === "free_trial" &&
        trialDaysLeft <= 3 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FiClock className="text-yellow-500" size={20} />
              <div>
                <p className="font-medium text-yellow-800">
                  Only {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left
                  in your free trial
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
      {(staticSubscriptionData.subscriptionStatus === "free_trial" ||
        staticSubscriptionData.subscriptionStatus === "none" ||
        staticSubscriptionData.subscriptionStatus === "expired") && (
        <div className="mt-6 text-center">
          {!staticSubscriptionData.freeTrialUsed ? (
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
            {!staticSubscriptionData.freeTrialUsed
              ? "Get 30 days free trial with unlimited contact reveals"
              : "Get 30 direct contact reveals for ₹200/month"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
