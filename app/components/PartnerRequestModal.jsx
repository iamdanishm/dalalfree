"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiTrendingUp, FiX, FiCheck } from "react-icons/fi";

export default function PartnerRequestModal({
  isOpen,
  onClose,
  onSubmitRequest,
  loading = false,
}) {
  const handleSubmit = async () => {
    if (onSubmitRequest) {
      await onSubmitRequest();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            onKeyDown={handleKeyDown}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <FiUsers className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Become a Dalal Free Partner
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  disabled={loading}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Process Steps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">How it works:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>Submit Request:</strong> Click below to send your partner request
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>Admin Review:</strong> Our team reviews your account and verifies details
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>Get Approved:</strong> Once approved, you'll become a verified partner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Partner Benefits:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FiTrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">90% Commission</p>
                        <p className="text-xs text-gray-600">Earn 90% from every deal you close</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiUsers className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dedicated Dashboard</p>
                        <p className="text-xs text-gray-600">Manage properties and track commissions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Priority Support</p>
                        <p className="text-xs text-gray-600">Get priority assistance and tools</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Partner Advantage:</strong> Join our network of successful real estate professionals and start earning higher commissions today!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Request...
                    </div>
                  ) : (
                    "Send Partner Request"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}