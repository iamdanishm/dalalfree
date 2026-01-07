"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ConfirmationModal from "@/app/components/ConfirmationModal";

export default function OwnerActions({ propertyId, propertySlug }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    // Navigate to edit page - you can customize this route
    router.push(`/dashboard/user/properties/edit/${propertySlug}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to user's properties page or show success
        router.push("/dashboard/user/properties");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("An error occurred while deleting the property");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Property Actions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your property listing
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            <FiEdit className="w-5 h-5" />
            Edit Property
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium"
          >
            <FiTrash2 className="w-5 h-5" />
            Delete Property
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
}
