"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertTriangle } from "react-icons/fi";

export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Reject Property",
  message = "Please provide a reason for rejection:",
  confirmText = "Reject Property",
  cancelText = "Cancel",
  confirmButtonColor = "bg-red-600 hover:bg-red-700",
  icon = <FiAlertTriangle className="w-6 h-6 text-red-500" />,
  loading = false,
  propertyTitle = "",
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = async () => {
    if (onConfirm && rejectionReason.trim()) {
      await onConfirm(rejectionReason.trim());
    }
  };

  const handleClose = () => {
    setRejectionReason("");
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
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
            onClick={handleClose}
            onKeyDown={handleKeyDown}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl border border-border max-w-md w-full mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  {icon}
                  <h3 className="text-lg font-semibold text-heading">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-muted hover:text-heading transition-colors p-1"
                  disabled={loading}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-body text-sm">
                  {message} {propertyTitle && `"${propertyTitle}"`}
                </p>

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter the reason for rejection..."
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-body hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading || !rejectionReason.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonColor}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </div>
                  ) : (
                    confirmText
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