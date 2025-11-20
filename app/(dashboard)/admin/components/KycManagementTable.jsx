"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFileText,
  FiVideo,
} from "react-icons/fi";

export default function KycManagementTable() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalKycs, setTotalKycs] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchKycs = async (page = 1, status = "", search = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/kyc?${params}`);
      const data = await response.json();

      if (response.ok) {
        setKycs(data.kycs || []);
        setTotalKycs(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.page || 1);
      } else {
        setError(data.error || "Failed to fetch KYC applications");
      }
    } catch (err) {
      setError("Failed to fetch KYC applications");
      console.error("Error fetching KYC applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycs();
  }, []);

  const handleReview = async (kycId, action, reason = "") => {
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";

      const response = await fetch(`/api/admin/kyc/${kycId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: action === "reject" ? reason : undefined,
        }),
      });

      if (response.ok) {
        alert(`KYC application ${newStatus} successfully`);
        fetchKycs(currentPage, statusFilter, searchTerm);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update KYC application");
      }
    } catch (err) {
      console.error("Error updating KYC:", err);
      alert("Failed to update KYC application");
    }
  };

  const handleSearch = () => {
    fetchKycs(1, statusFilter, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchKycs(page, statusFilter, searchTerm);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalColor = (level) => {
    switch (level?.toLowerCase()) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "partner":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && kycs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted">Loading KYC applications...</span>
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
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-heading flex items-center">
            <FiShield className="w-5 h-5 mr-2 text-primary" />
            KYC Application Queue
          </h2>
          <div className="text-sm text-muted">
            Total: {totalKycs} applications
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by user name or email..."
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Reviewed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kycs.map((kyc, index) => (
                <motion.tr
                  key={kyc._id || index}
                  className="hover:bg-surface transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {kyc.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-heading">
                          {kyc.userId?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted">
                          {kyc.userId?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(
                          kyc.approvalLevel
                        )}`}
                      >
                        {kyc.approvalLevel || "Basic"}
                      </span>
                      {kyc.documentUrls?.length > 0 && (
                        <FiFileText
                          className="w-4 h-4 text-muted"
                          title="Documents attached"
                        />
                      )}
                      {kyc.videoUrl && (
                        <FiVideo
                          className="w-4 h-4 text-muted"
                          title="Video submitted"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        kyc.status
                      )}`}
                    >
                      {kyc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-body">
                    {kyc.createdAt
                      ? new Date(kyc.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-body">
                    {kyc.reviewedBy?.name || (kyc.reviewedAt ? "Auto" : "-")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Review Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {kyc.status === "pending" ? (
                        <>
                          <button
                            className="text-green-600 hover:text-green-800 p-1"
                            onClick={() => handleReview(kyc._id, "approve")}
                            title="Approve"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1"
                            onClick={() => {
                              const reason = prompt("Reason for rejection:");
                              if (reason)
                                handleReview(kyc._id, "reject", reason);
                            }}
                            title="Reject"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-muted text-xs">
                          {kyc.status === "approved" ? "Approved" : "Rejected"}
                        </span>
                      )}
                      {kyc.documentUrls?.length > 0 && (
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="Download Documents"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
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
            Showing page {currentPage} of {totalPages} ({totalKycs} total
            applications)
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
  );
}
