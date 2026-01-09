"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/app/lib/hooks/useToast";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import {
  FiHome,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiUpload,
  FiX,
} from "react-icons/fi";
import Image from "next/image";

export default function AmenitiesManagementTable() {
  const { success, error: toastError, promise } = useToast();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmenities, setTotalAmenities] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [selectedAmenityToDelete, setSelectedAmenityToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    available: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Mock data for UI testing
  const mockAmenities = [
    {
      _id: "1",
      title: "Swimming Pool",
      image: "/images/hero-image.png",
      available: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Gym",
      image: "/images/hero-image1.png",
      available: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Parking",
      image: "/images/hero-image2.png",
      available: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const fetchAmenities = async (page = 1, search = "", showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/amenities?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAmenities(data.amenities || []);
        setTotalAmenities(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.page || 1);
      } else {
        setError(data.error || "Failed to fetch amenities");
      }
    } catch (err) {
      setError("Failed to fetch amenities");
      console.error("Error fetching amenities:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSearch = () => {
    fetchAmenities(1, searchTerm);
  };

  useEffect(() => {
    // Initial load from API
    fetchAmenities(1, "", false);
  }, []);

  const handlePageChange = (page) => {
    fetchAmenities(page, searchTerm);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", image: null, available: true });
    setImagePreview(null);
  };

  const handleAddAmenity = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditAmenity = (amenity) => {
    setSelectedAmenity(amenity);
    setFormData({
      title: amenity.title,
      image: null,
      available: amenity.available,
    });
    setImagePreview(amenity.image);
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("available", formData.available.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch("/api/admin/amenities", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setUploading(false);
        setShowAddModal(false);
        resetForm();
        fetchAmenities(currentPage, searchTerm);
        success("Amenity added successfully!");
      } else {
        throw new Error(data.error || "Failed to add amenity");
      }
    } catch (error) {
      setUploading(false);
      toastError(error.message || "Failed to add amenity");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("available", formData.available.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(
        `/api/admin/amenities/${selectedAmenity._id}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUploading(false);
        setShowEditModal(false);
        setSelectedAmenity(null);
        resetForm();
        fetchAmenities(currentPage, searchTerm);
        success("Amenity updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update amenity");
      }
    } catch (error) {
      setUploading(false);
      toastError(error.message || "Failed to update amenity");
    }
  };

  const handleDeleteAmenity = (amenity) => {
    setSelectedAmenityToDelete(amenity);
    setShowDeleteModal(true);
  };

  const confirmDeleteAmenity = async () => {
    if (!selectedAmenityToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(
        `/api/admin/amenities/${selectedAmenityToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchAmenities(currentPage, searchTerm);
        success("Amenity deleted successfully!");
        setShowDeleteModal(false);
        setSelectedAmenityToDelete(null);
      } else {
        throw new Error(data.error || "Failed to delete amenity");
      }
    } catch (error) {
      toastError(error.message || "Failed to delete amenity");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleAvailability = async (amenityId, currentStatus) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", "temp"); // Required but will be overridden
      formDataToSend.append("available", (!currentStatus).toString());

      const response = await fetch(`/api/admin/amenities/${amenityId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        fetchAmenities(currentPage, searchTerm);
        success(
          `Amenity ${!currentStatus ? "enabled" : "disabled"} successfully!`
        );
      } else {
        throw new Error(data.error || "Failed to update amenity status");
      }
    } catch (error) {
      toastError(error.message || "Failed to update amenity status");
    }
  };

  if (loading && amenities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted">Loading amenities...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-soft border border-border overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-heading flex items-center">
              <FiHome className="w-5 h-5 mr-2 text-primary" />
              Amenities Management
            </h2>
            <div className="text-sm text-muted">
              Total: {totalAmenities} amenities
            </div>
          </div>

          {/* Filters and Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.div
              className="relative flex-1 flex gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <motion.input
                  type="text"
                  placeholder="Search amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      fetchAmenities(1, "");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-heading transition-colors"
                    title="Clear search"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <motion.button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                Search
              </motion.button>
            </motion.div>

            <motion.button
              onClick={handleAddAmenity}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 whitespace-nowrap flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Amenity
            </motion.button>
          </motion.div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {amenities.map((amenity, index) => (
                  <motion.tr
                    key={amenity._id || index}
                    className="hover:bg-surface transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={amenity.image}
                          alt={amenity.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSI4IiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHBhdGggZD0iTTE2IDIwaDE2djhoLTE2di04em04LTQwMS4xIDAgMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yIDIuOS0yIDItLjkgMnptMCAxMmMyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPg==";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-heading">
                        {amenity.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleAvailability(amenity._id, amenity.available)
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          amenity.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {amenity.available ? "Available" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">
                      {amenity.createdAt
                        ? new Date(amenity.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-orange-600 hover:text-orange-800 p-1"
                          title="Edit Amenity"
                          onClick={() => handleEditAmenity(amenity)}
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => handleDeleteAmenity(amenity)}
                          title="Delete Amenity"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!error && totalPages > 1 && (
          <motion.div
            className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <div className="text-sm text-muted">
              Showing page {currentPage} of {totalPages} ({totalAmenities} total
              amenities)
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronLeft className="w-4 h-4" />
              </motion.button>
              <span className="px-3 py-1 border border-border rounded-md bg-white font-medium">
                {currentPage}
              </span>
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Amenity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-heading">
                Add New Amenity
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-heading"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Image
                </label>
                <div className="space-y-2">
                  <input
                    id="add-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="add-image-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <FiUpload className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.image ? formData.image.name : "Choose an image"}
                    </span>
                  </label>
                  {imagePreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHBhdGggZD0iTTI2IDMwSDU0djE2SDI2di0xNnpNNTQgNTguOXYwIDIgLTkgMi0yIC45LTIgMiAuOS0yIDItLjkgMi0yIC45LTJWNTguOXptMCAyNGM0LjQgMCA4LTMuNiA4LThzLTMuNi04LTgtOC04IDMuNi04IDggMy42IDggOCA4IDh6IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPg==";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="available" className="text-sm text-body">
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-body hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Adding..." : "Add Amenity"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Amenity Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-heading">
                Edit Amenity
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted hover:text-heading"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Image (leave empty to keep current)
                </label>
                <div className="space-y-2">
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                  >
                    <FiUpload className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.image ? formData.image.name : "Choose an image"}
                    </span>
                  </label>
                  {imagePreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHBhdGggZD0iTTI2IDMwSDU0djE2SDI2di0xNnpNNTQgNTguOXYwIDIgLTkgMi0yIC45LTIgMiAuOS0yIDItLjkgMi0yIC45LTJWNTguOXptMCAyNGM0LjQgMCA4LTMuNiA4LThzLTMuNi04LTgtOC04IDMuNi04IDggMy42IDggOCA4IDh6IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPg==";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-available"
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="edit-available" className="text-sm text-body">
                  Available
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-body hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Updating..." : "Update Amenity"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAmenityToDelete(null);
        }}
        onConfirm={confirmDeleteAmenity}
        title="Delete Amenity"
        message={`Are you sure you want to delete "${selectedAmenityToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        loading={deleteLoading}
      />
    </>
  );
}
