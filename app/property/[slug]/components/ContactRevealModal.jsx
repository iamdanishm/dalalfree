"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiCreditCard,
  FiAward,
  FiX,
  FiPhone,
  FiMail,
  FiCheck,
} from "react-icons/fi";

export default function ContactRevealModal({
  isOpen,
  onClose,
  owner,
  revealMethod,
  onReveal,
  userSubscription,
}) {
  const [step, setStep] = useState("method"); // method, processing, success
  const [selectedCredits, setSelectedCredits] = useState(30);

  const handleReveal = async () => {
    setStep("processing");

    // Simulate API call
    setTimeout(() => {
      onReveal(revealMethod);
      setStep("success");
    }, 2000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
        Unlock Contact Details
      </h3>

      {userSubscription.subscriptionStatus === "none" ? (
        <>
          {/* Watch Ad Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReveal("ad_watch")}
            className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-3 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPlay className="text-blue-600" size={20} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-blue-900">Watch Ad</div>
              <div className="text-sm text-blue-700">
                Reveal instantly with 1 credit
              </div>
            </div>
            <div className="text-blue-600 font-semibold">Free</div>
          </motion.button>

          {/* Buy Credits Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReveal("purchase")}
            className="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg flex items-center gap-3 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCreditCard className="text-green-600" size={20} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-green-900">₹200 Package</div>
              <div className="text-sm text-green-700">
                30 lifetime contact reveals
              </div>
            </div>
            <div className="text-green-600 font-semibold">₹200</div>
          </motion.button>

          {/* Free Trial Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReveal("free_trial")}
            className="w-full p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-3 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiAward className="text-purple-600" size={20} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-purple-900">Free Trial</div>
              <div className="text-sm text-purple-700">
                30 days unlimited access
              </div>
            </div>
            <div className="text-purple-600 font-semibold">Free</div>
          </motion.button>
        </>
      ) : userSubscription.subscriptionStatus === "free_trial" ? (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <FiCheck className="mx-auto mb-2 text-green-600" size={32} />
          <p className="font-medium text-green-900 mb-1">Contact Available!</p>
          <p className="text-sm text-green-700">
            You have {calculateTrialDaysLeft()} days left in your free trial
          </p>
        </div>
      ) : (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <FiAward className="mx-auto mb-2 text-yellow-600" size={32} />
          <p className="font-medium text-yellow-900 mb-1">Premium Access</p>
          <p className="text-sm text-yellow-700">Unlimited contact reveals</p>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <motion.div
        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="font-medium text-gray-900">
        {revealMethod === "ad_watch"
          ? "Processing ad view..."
          : revealMethod === "purchase"
          ? "Processing payment..."
          : "Activating free trial..."}
      </p>
      <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
    </div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <FiCheck className="text-green-600" size={32} />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Contact Revealed!
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center gap-3 text-gray-700 mb-2">
          <FiPhone size={16} />
          <span className="font-medium">{owner.contact}</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-gray-700">
          <FiMail size={16} />
          <span className="font-medium">{owner.email}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Got it
      </button>
    </motion.div>
  );

  const calculateTrialDaysLeft = () => {
    if (!userSubscription?.freeTrialEndDate) return 0;
    const now = new Date();
    const endDate = new Date(userSubscription.freeTrialEndDate);
    const diffTime = endDate - now;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Contact Property Owner
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6">
            {step === "method" && renderMethodSelection()}
            {step === "processing" && renderProcessing()}
            {step === "success" && renderSuccess()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
