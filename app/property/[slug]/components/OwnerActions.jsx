"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OwnerActions({ propertyId, propertySlug, property, onDeleteClick }) {
  const { data: session } = useSession();
  const router = useRouter();

  // console.log("OwnerActions rendered with:", { propertyId, propertySlug, property });
  // console.log("Property status:", property?.status);
  // console.log("Property rejectionReason:", property?.rejectionReason);

  const handleEdit = () => {
    // Navigate to edit page
    router.push(`/user/properties/edit/${propertySlug}`);
  };



  return (
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
        {property?.status !== "rejected" && (
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium"
          >
            <FiEdit className="w-5 h-5" />
            Edit Property
          </button>
        )}
        <button
          onClick={onDeleteClick}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium"
        >
          <FiTrash2 className="w-5 h-5" />
          Delete Property
        </button>
      </div>
    </motion.div>
  );
}