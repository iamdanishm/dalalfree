"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiMapPin,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";

export default function PropertiesManagementTable() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchProperties = async (page = 1, status = "", search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/properties?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProperties(data.properties || []);
        setTotalProperties(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.page || 1);
      } else {
        setError(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError("Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleReview = async (propertyId, action, reason = "") => {
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";

      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: action === "reject" ? reason : undefined,
        }),
      });

      if (response.ok) {
        alert(`Property ${newStatus} successfully`);
        fetchProperties(currentPage, statusFilter, searchTerm);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update property");
      }
    } catch (err) {
      console.error("Error updating property:", err);
      alert("Failed to update property");
    }
  };

  const handleSearch = () => {
    fetchProperties(1, statusFilter, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchProperties(page, statusFilter, searchTerm);
  };

  const openImageModal = (property, imageIndex = 0) => {
    setSelectedProperty(property);
    setCurrentImageIndex(imageIndex);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "featured":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted">Loading properties...</span>
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
              Property Approval Queue
            </h2>
            <div className="text-sm text-muted">
              Total: {totalProperties} properties
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title, address, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="featured">Featured</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
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
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property, index) => (
                  <motion.tr
                    key={property._id || index}
                    className="hover:bg-surface transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {property.images?.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt="Property"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openImageModal(property, 0)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <FiImage className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-heading">
                            {property.title || "Untitled Property"}
                          </div>
                          <div className="text-sm text-muted flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {property.address || "No address"}
                          </div>
                          {property.price && (
                            <div className="text-sm font-medium text-green-600 flex items-center">
                              <FiDollarSign className="w-3 h-3 mr-1" />
                              {property.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-xs mr-2">
                          {property.ownerId?.name?.charAt(0)?.toUpperCase() ||
                            "O"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-heading">
                            {property.ownerId?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-muted flex items-center">
                            <FiUser className="w-3 h-3 mr-1" />
                            {property.ownerId?.role || "user"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">
                      <div className="space-y-1">
                        <div>Type: {property.propertyType || "N/A"}</div>
                        <div>
                          Area:{" "}
                          {property.area ? `${property.area} sq ft` : "N/A"}
                        </div>
                        <div>Images: {property.images?.length || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">
                      {property.createdAt
                        ? new Date(property.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => openImageModal(property)}
                          title="View Images"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {property.status === "pending" ? (
                          <>
                            <button
                              className="text-green-600 hover:text-green-800 p-1"
                              onClick={() =>
                                handleReview(property._id, "approve")
                              }
                              title="Approve Property"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 p-1"
                              onClick={() => {
                                const reason = prompt("Reason for rejection:");
                                if (reason)
                                  handleReview(property._id, "reject", reason);
                              }}
                              title="Reject Property"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-muted text-xs">
                            {property.status === "approved"
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        )}
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
          <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted">
              Showing page {currentPage} of {totalPages} ({totalProperties}{" "}
              total properties)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 border border-border rounded-md bg-white">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageModal && selectedProperty && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="relative max-w-4xl max-h-full p-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Property Info */}
              <div className="mb-4 text-white">
                <h3 className="text-xl font-bold">{selectedProperty.title}</h3>
                <p className="text-gray-300">{selectedProperty.address}</p>
                <p className="text-lg font-semibold text-green-400">
                  ${selectedProperty.price?.toLocaleString()}
                </p>
              </div>

              {/* Image Display */}
              {selectedProperty.images?.length > 0 ? (
                <div className="relative">
                  <img
                    src={selectedProperty.images[currentImageIndex]}
                    alt={`Property ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />

                  {/* Navigation */}
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedProperty.images.length}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No images available</p>
                </div>
              )}

              {/* Property Details */}
              <div className="mt-4 bg-white rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedProperty.propertyType}
                  </div>
                  <div>
                    <span className="font-medium">Area:</span>{" "}
                    {selectedProperty.area} sq ft
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 py-1 text-xs rounded-full ${getStatusColor(
                        selectedProperty.status
                      )}`}
                    >
                      {selectedProperty.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span>{" "}
                    {selectedProperty.ownerId?.name}
                  </div>
                </div>
                {selectedProperty.description && (
                  <div className="mt-4">
                    <span className="font-medium">Description:</span>
                    <p className="mt-2 text-gray-700">
                      {selectedProperty.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
