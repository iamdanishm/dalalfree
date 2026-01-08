"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Select from "react-select";
import { MdKeyboardArrowDown } from "react-icons/md";
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

export default function PropertiesManagementTable() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleStatusFilterChange = useCallback(() => {
    if (!initialLoad) {
      // Only use status filter if explicitly set, otherwise show all
      const status = statusFilter?.value || "";
      fetchProperties(1, status, "");
    }
  }, [initialLoad, statusFilter]);

  useEffect(() => {
    handleStatusFilterChange();
  }, [handleStatusFilterChange]);

  const handleApprove = async (propertyId) => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true, status: "approved" }),
      });

      if (response.ok) {
        alert("Property approved successfully");
        fetchProperties(currentPage, statusFilter?.value || "", searchTerm);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve property");
      }
    } catch (err) {
      console.error("Error approving property:", err);
      alert("Failed to approve property");
    }
  };

  const handleReject = async (propertyId) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
      });

      if (response.ok) {
        alert("Property rejected");
        fetchProperties(currentPage, statusFilter?.value || "", searchTerm);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject property");
      }
    } catch (err) {
      console.error("Error rejecting property:", err);
      alert("Failed to reject property");
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Property deleted successfully");
        fetchProperties(currentPage, statusFilter?.value || "", searchTerm);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete property");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
    }
  };

  const handleSearch = () => {
    fetchProperties(1, statusFilter?.value || "", searchTerm);
  };

  const handlePageChange = (page) => {
    fetchProperties(page, statusFilter?.value || "", searchTerm);
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
    // Handle both array of objects with url property and plain strings
    const firstImage = images[0];
    if (typeof firstImage === "string") {
      return firstImage;
    }
    return firstImage?.url || null;
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
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
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
                { value: "featured", label: "Featured" },
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
              {properties.map((property) => {
                const imageUrl = getImageUrl(property.images);
                return (
                  <motion.tr
                    key={property._id}
                    className="hover:bg-surface transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                            Rs {property.price?.toLocaleString() || "0"}
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
                          className="text-green-600 hover:text-green-800 p-1"
                          onClick={() => handleApprove(property._id)}
                          title="Approve"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => handleReject(property._id)}
                          title="Reject"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1"
                          onClick={() => handleDelete(property._id)}
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!error && totalPages > 1 && (
        <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted">
            Showing page {currentPage} of {totalPages} ({totalProperties} total)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 border border-border rounded-md bg-white font-medium">
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
  );
}
