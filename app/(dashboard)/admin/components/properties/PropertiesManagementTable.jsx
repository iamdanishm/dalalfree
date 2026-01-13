"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Select from "react-select";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useToast } from "@/app/lib/hooks/useToast";
import {
  FiHome,
  FiSearch,
  FiCheck,
  FiX,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiMapPin,
} from "react-icons/fi";
import PropertyDetailModal from "./PropertyDetailModal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import RejectionModal from "@/app/components/RejectionModal";

export default function PropertiesManagementTable() {
  const { success, error: showError } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [selectedPropertyForAction, setSelectedPropertyForAction] =
    useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProperties = async (
    page = 1,
    status = "",
    search = "",
    showLoading = false
  ) => {
    try {
      if (showLoading) setLoading(true);
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
      if (showLoading) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    fetchProperties(1, "", "", true);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (!initialLoad) {
      fetchProperties(1, statusFilter?.value || "", debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, statusFilter]);

  const handleStatusFilterChange = useCallback(() => {
    if (!initialLoad) {
      const status = statusFilter?.value || "";
      fetchProperties(1, status, debouncedSearchTerm);
    }
  }, [initialLoad, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    handleStatusFilterChange();
  }, [handleStatusFilterChange]);

  const handleApproveClick = (property) => {
    setSelectedPropertyForAction(property);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedPropertyForAction) return;

    console.log("Frontend approve request:", {
      propertyId: selectedPropertyForAction._id,
      propertyTitle: selectedPropertyForAction.title,
      propertyStatus: selectedPropertyForAction.status,
    });

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${selectedPropertyForAction._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved", verified: true }),
        }
      );

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setShowApproveModal(false);
        setSelectedPropertyForAction(null);
        success(`Property "${selectedPropertyForAction.title}" approved successfully!`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve property");
      }
    } catch (err) {
      console.error("Error approving property:", err);
      showError(err.message || "Failed to approve property");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (propertyId) => {
    // Keep for backward compatibility with PropertyDetailModal
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true, status: "approved" }),
      });

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setSelectedProperty(null); // Close modal
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve property");
      }
    } catch (err) {
      console.error("Error approving property:", err);
      throw err;
    }
  };

  const handleRejectClick = (property) => {
    setSelectedPropertyForAction(property);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async (reason) => {
    if (!selectedPropertyForAction || !reason?.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${selectedPropertyForAction._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason: reason.trim(),
          }),
        }
      );

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setShowRejectModal(false);
        setSelectedPropertyForAction(null);
        success(`Property "${selectedPropertyForAction.title}" rejected successfully!`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject property");
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      showError(err.message || "Failed to reject property");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (propertyId, reason = "Rejected by admin") => {
    // Keep for backward compatibility with PropertyDetailModal
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setSelectedProperty(null); // Close modal
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject property");
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      throw err;
    }
  };

  const handleDeleteClick = (property) => {
    setSelectedPropertyForAction(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPropertyForAction) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${selectedPropertyForAction._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isArchived: true,
            archivedReason: "Archived by admin",
          }),
        }
      );

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setShowDeleteModal(false);
        setSelectedPropertyForAction(null);
        success(`Property "${selectedPropertyForAction.title}" archived successfully!`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete property");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      showError(err.message || "Failed to archive property");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnarchiveClick = (property) => {
    setSelectedPropertyForAction(property);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    if (!selectedPropertyForAction) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${selectedPropertyForAction._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: false }),
        }
      );

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setShowUnarchiveModal(false);
        setSelectedPropertyForAction(null);
        success(`Property "${selectedPropertyForAction.title}" unarchived successfully!`);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to unarchive property");
      }
    } catch (err) {
      console.error("Error unarchiving property:", err);
      showError(err.message || "Failed to unarchive property");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    // Keep for backward compatibility with PropertyDetailModal - use archive
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isArchived: true,
          archivedReason: "Archived by admin",
        }),
      });

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setSelectedProperty(null); // Close modal
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to archive property");
      }
    } catch (err) {
      console.error("Error archiving property:", err);
      throw err;
    }
  };

  const handleUnarchive = async (propertyId) => {
    // For backward compatibility with PropertyDetailModal
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false }),
      });

      if (response.ok) {
        fetchProperties(
          currentPage,
          statusFilter?.value || "",
          debouncedSearchTerm
        );
        setSelectedProperty(null); // Close modal
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to unarchive property");
      }
    } catch (err) {
      console.error("Error unarchiving property:", err);
      throw err;
    }
  };

  const handlePageChange = (page) => {
    fetchProperties(page, statusFilter?.value || "", debouncedSearchTerm);
  };

  const getStatusColor = (status, isArchived = false) => {
    if (isArchived) {
      return "bg-orange-100 text-orange-800";
    }

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

  const truncateTitle = (title, maxLength = 30) => {
    if (!title) return "";
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const getImageUrl = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    const firstImage = images[0];
    if (typeof firstImage === "string") {
      return firstImage;
    }
    return firstImage?.url || null;
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    if (price < 100000) {
      // Less than 1 lakh - show as-is with commas
      return `₹${price.toLocaleString("en-IN")}`;
    }
    // 1 lakh or more - show in lakhs
    const lakhs = price / 100000;
    return `₹${lakhs.toLocaleString("en-IN", {
      minimumFractionDigits: lakhs < 10 ? 1 : 0,
      maximumFractionDigits: 2,
    })} Lakh`;
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
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-heading flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-primary" />
              Properties
            </h2>
            <div className="text-sm text-muted">
              Total: {totalProperties} properties
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(selectedOption) => setStatusFilter(selectedOption)}
                options={[
                  { value: "", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ]}
                placeholder="All Status"
                className="w-full"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "0.25rem",
                    minHeight: "42px",
                    boxShadow: "none",
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                  ),
                }}
              />
            </div>
          </div>
        </div>

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
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Type
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
                {properties.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <FiMapPin className="w-12 h-12 text-muted" />
                        <div>
                          <h3 className="text-lg font-medium text-heading">
                            No Properties Found
                          </h3>
                          <p className="text-muted mt-1">
                            {searchTerm || statusFilter?.value
                              ? "No properties match your current filters. Try adjusting your search criteria."
                              : "There are no property listings yet. Properties will appear here once users start posting them."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  properties.map((property) => {
                    const imageUrl = getImageUrl(property.images);
                    return (
                      <motion.tr
                        key={property._id}
                        className="hover:bg-surface transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={property.title || "Property"}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                      '<div className="w-full h-full flex items-center justify-center bg-gray-200"><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <FiImage className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div
                                className="text-sm font-medium text-heading max-w-[200px] truncate"
                                title={property.title}
                              >
                                {truncateTitle(property.title, 25)}
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {formatPrice(property.price)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-heading">
                            {property.ownerId?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted capitalize">
                            {property.ownerId?.role || "user"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                            {property.propertyType || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              property.status,
                              property.isArchived
                            )}`}
                          >
                            {property.isArchived ? "Archived" : property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-body">
                          {property.createdAt
                            ? new Date(property.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {property.status === "pending" &&
                              !property.isArchived && (
                                <>
                                  <button
                                    className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800 rounded-lg transition-all duration-200 hover:scale-105"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveClick(property);
                                    }}
                                    title="Approve Property"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-105"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRejectClick(property);
                                    }}
                                    title="Reject Property"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            {property.status !== "pending" &&
                              !property.isArchived && (
                                <button
                                  className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 hover:scale-105"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(property);
                                  }}
                                  title="Delete Property"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            {property.isArchived && (
                              <button
                                className="flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 rounded-lg transition-all duration-200 hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveClick(property);
                                }}
                                title="Unarchive Property"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {!error && totalPages > 1 && (
          <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted">
              Showing page {currentPage} of {totalPages} ({totalProperties}{" "}
              total)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxVisiblePages / 2)
                );
                let endPage = Math.min(
                  totalPages,
                  startPage + maxVisiblePages - 1
                );

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1 border border-border rounded-md ${
                        i === currentPage
                          ? "bg-primary text-white border-primary"
                          : "hover:bg-white"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                return pages;
              })()}

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

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onUnarchive={handleUnarchive}
      />

      {/* Approve Property Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedPropertyForAction(null);
        }}
        onConfirm={confirmApprove}
        title="Approve Property"
        message={`Are you sure you want to approve "${selectedPropertyForAction?.title}"? This will make the property visible to all users.`}
        confirmText="Approve"
        cancelText="Cancel"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
        loading={actionLoading}
      />

      {/* Reject Property Modal */}
      <RejectionModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedPropertyForAction(null);
        }}
        onConfirm={confirmReject}
        propertyTitle={selectedPropertyForAction?.title}
        loading={actionLoading}
      />

      {/* Delete Property Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPropertyForAction(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${selectedPropertyForAction?.title}"? This action will archive the property.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
        loading={actionLoading}
      />

      {/* Unarchive Property Modal */}
      <ConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={() => {
          setShowUnarchiveModal(false);
          setSelectedPropertyForAction(null);
        }}
        onConfirm={confirmUnarchive}
        title="Unarchive Property"
        message={`Are you sure you want to unarchive "${selectedPropertyForAction?.title}"? This will make the property visible again.`}
        confirmText="Unarchive"
        cancelText="Cancel"
        confirmButtonColor="bg-blue-600 hover:bg-blue-700"
        loading={actionLoading}
      />
    </>
  );
}