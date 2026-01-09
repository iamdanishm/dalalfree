"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdCheckCircle, MdCancel } from "react-icons/md";
import { FiTrash2, FiX } from "react-icons/fi";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import PropertyDetailsTab from "./PropertyDetailsTab";
import PropertyGalleryTab from "./PropertyGalleryTab";
import PropertyNearbyTab from "./PropertyNearbyTab";
import PropertyKYCTab from "./PropertyKYCTab";
import PropertyAmenitiesTab from "./PropertyAmenitiesTab";

export default function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("details");

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal handlers
  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!onApprove) return;

    setActionLoading(true);
    try {
      await onApprove(property._id);
      setShowApproveModal(false);
      // Success message handled by parent component
    } catch (err) {
      console.error("Error approving property:", err);
      // Error message handled by parent component
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => {
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!onReject || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      await onReject(property._id, rejectionReason.trim());
      setShowRejectModal(false);
      setRejectionReason("");
      // Success message handled by parent component
    } catch (err) {
      console.error("Error rejecting property:", err);
      // Error message handled by parent component
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;

    setActionLoading(true);
    try {
      await onDelete(property._id);
      setShowDeleteModal(false);
      // Success message handled by parent component
    } catch (err) {
      console.error("Error deleting property:", err);
      // Error message handled by parent component
    } finally {
      setActionLoading(false);
    }
  };

  // Process images and videos for gallery - moved before early return for useEffect
  const processedMedia = property
    ? [
        ...(property.images || [])
          .filter((img) => img && img.url)
          .map((img) => ({
            src: img.url,
            type: "image",
            category: img.category || "other",
            order: img.order || 0,
            thumbnail: img.url,
          })),
        ...(property.videos || [])
          .filter((vid) => vid && vid.url)
          .map((vid) => ({
            src: vid.url,
            type: "video",
            thumbnail: property.images?.[0]?.url || null,
            order: vid.order || 0,
          })),
      ].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const imageCount = processedMedia.filter((m) => m.type === "image").length;
  const videoCount = processedMedia.filter((m) => m.type === "video").length;

  if (!isOpen || !property) return null;

  // Reset state when property changes by using a key
  const modalKey = property._id;

  const tabs = [
    { id: "details", label: "Details" },
    {
      id: "gallery",
      label: `Gallery (${imageCount} photos, ${videoCount} videos)`,
    },
    { id: "nearby", label: "Nearby" },
    { id: "kyc", label: "KYC" },
    { id: "amenities", label: "Amenities" },
  ];

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            key={modalKey}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-heading">
                  Property Details
                </h2>
                <p className="text-sm text-muted font-mono">
                  ID: {property._id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {property.status === "pending" && (
                  <>
                    <button
                      onClick={handleRejectClick}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <MdCancel className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={handleApproveClick}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MdCheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </>
                )}
                {property.status !== "pending" && onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete Property"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-2"
                >
                  <MdClose className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-heading"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Details Tab */}
              {activeTab === "details" && (
                <PropertyDetailsTab property={property} />
              )}

              {/* Gallery Tab */}
              {activeTab === "gallery" && (
                <PropertyGalleryTab property={property} />
              )}

              {/* Nearby Tab */}
              {activeTab === "nearby" && (
                <PropertyNearbyTab property={property} />
              )}

              {/* KYC Tab */}
              {activeTab === "kyc" && <PropertyKYCTab property={property} />}

              {/* Amenities Tab */}
              {activeTab === "amenities" && (
                <PropertyAmenitiesTab property={property} />
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Approve Property Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
        }}
        onConfirm={confirmApprove}
        title="Approve Property"
        message={`Are you sure you want to approve "${property.title}"? This will make the property visible to all users.`}
        confirmText="Approve"
        cancelText="Cancel"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
        loading={actionLoading}
      />

      {/* Reject Property Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-heading">
                Reject Property
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="text-muted hover:text-heading"
                disabled={actionLoading}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-body text-sm">
                  Please provide a reason for rejecting "{property.title}":
                </p>
              </div>

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
                  disabled={actionLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-body hover:bg-surface transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </div>
                  ) : (
                    "Reject Property"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Property Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        onConfirm={confirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${property.title}"? This action cannot be undone and will permanently remove the property.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        loading={actionLoading}
      />
    </>
  );
}
