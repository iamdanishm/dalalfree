"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone, FiShield, FiEdit, FiHome, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp, FiCheck, FiSlash, FiAlertCircle } from "react-icons/fi";
import { useToast } from "@/app/lib/hooks/useToast";

export default function UserDetailModal({ isOpen, onClose, onEdit, onUpdate, userId }) {
    const { success, error: showError } = useToast();
    const handleEditClick = (user) => {
        onClose(); // Close the detail modal first
        onEdit(user); // Then open the edit modal
    };
    const [user, setUser] = useState(null);
    const [propertyStats, setPropertyStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // Approval flow states
    const [showApproveForm, setShowApproveForm] = useState(false);
    const [approveReraNumber, setApproveReraNumber] = useState("");
    const [approveError, setApproveError] = useState("");

    // Fetch user details when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        setShowApproveForm(false);
        setApproveReraNumber("");

        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setPropertyStats(data.propertyStats);
            } else {
                setError(data.error || "Failed to fetch user details");
            }
        } catch (err) {
            setError("Failed to fetch user details");
            console.error("Error fetching user details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerRequest = async (action) => {
        if (action === 'approve' && !showApproveForm) {
            setShowApproveForm(true);
            return;
        }

        if (action === 'approve' && !approveReraNumber.trim()) {
            setApproveError("RERA number is required to approve a partner");
            return;
        }

        setActionLoading(true);
        setApproveError("");

        try {
            const updates = {
                partnerRequestStatus: action === 'approve' ? 'approved' : 'rejected'
            };

            if (action === 'approve') {
                updates.role = 'partner';
                updates.reraNumber = approveReraNumber.trim();
                updates.partnerCommissionRate = 0.9; // Default commission
            }

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (response.ok) {
                success(`Partner request ${action}d successfully`);
                setShowApproveForm(false);
                fetchUserDetails(); // Refresh local details
                if (onUpdate) onUpdate(); // Refresh parent table
            } else {
                showError(data.error || `Failed to ${action} partner request`);
            }
        } catch (err) {
            console.error(`Error ${action}ing partner request:`, err);
            showError(`Failed to ${action} partner request`);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800";
            case "suspended":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            case "sub-admin":
                return "bg-indigo-100 text-indigo-800";
            case "partner":
                return "bg-blue-100 text-blue-800";
            case "user":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (!isOpen) return null;

    return (
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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-heading">{user?.name || "Loading..."}</h2>
                                <p className="text-sm text-muted">ID: {userId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {user && (
                                <motion.button
                                    onClick={() => handleEditClick(user)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiEdit className="w-4 h-4" />
                                    Edit User
                                </motion.button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-2"
                            >
                                <FiX className="w-5 h-5 text-muted" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted">Loading user details...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : user ? (
                            <div className="p-6 space-y-8">
                                {/* Partner Request Section */}
                                {user.partnerRequestStatus === 'pending' && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
                                            <FiShield className="w-5 h-5 mr-2" />
                                            Pending Partner Request
                                        </h3>
                                        <p className="text-orange-700 text-sm mb-4">
                                            This user has requested to become a partner. Review their details and approve or reject the request.
                                            {showApproveForm ? " Please enter the RERA number to complete the approval." : " On approval, you will be asked to provide their RERA number and their role will be updated to \"Partner\"."}
                                        </p>

                                        {showApproveForm ? (
                                            <div className="mb-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-orange-800 mb-1">
                                                        RERA registration number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={approveReraNumber}
                                                        onChange={(e) => setApproveReraNumber(e.target.value)}
                                                        placeholder="Enter RERA number"
                                                        className={`w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${approveError ? 'border-red-500' : 'border-gray-300'}`}
                                                    />
                                                    {approveError && (
                                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                                            <FiAlertCircle className="mr-1" /> {approveError}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handlePartnerRequest('approve')}
                                                        disabled={actionLoading}
                                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FiCheck className="mr-2" />}
                                                        Confirm Approval
                                                    </button>
                                                    <button
                                                        onClick={() => setShowApproveForm(false)}
                                                        disabled={actionLoading}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handlePartnerRequest('approve')}
                                                    disabled={actionLoading}
                                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                >
                                                    <FiCheck className="mr-2" />
                                                    Approve Request
                                                </button>
                                                <button
                                                    onClick={() => handlePartnerRequest('reject')}
                                                    disabled={actionLoading}
                                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                >
                                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <FiSlash className="mr-2" />}
                                                    Reject Request
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* User Profile Section */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-heading mb-4 flex items-center">
                                        <FiUser className="w-5 h-5 mr-2 text-primary" />
                                        User Profile
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted">Name:</span>
                                                <span className="text-sm text-heading">{user.name}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted flex items-center">
                                                    <FiMail className="w-4 h-4 mr-1" />
                                                    Email:
                                                </span>
                                                <span className="text-sm text-heading">{user.email}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted flex items-center">
                                                    <FiPhone className="w-4 h-4 mr-1" />
                                                    Phone:
                                                </span>
                                                <span className="text-sm text-heading">{user.phone || "Not provided"}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted">Role:</span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.displayRole || user.role}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Account Information */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted">Status:</span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted">Joined:</span>
                                                <span className="text-sm text-heading">{formatDate(user.createdAt)}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted">Last Updated:</span>
                                                <span className="text-sm text-heading">{formatDate(user.updatedAt)}</span>
                                            </div>

                                            {/* Conditional fields */}
                                            {user.reraNumber && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted">RERA Number:</span>
                                                    <span className="text-sm text-heading">{user.reraNumber}</span>
                                                </div>
                                            )}

                                            {user.accountStatusReason && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted">Status Reason:</span>
                                                    <span className="text-sm text-heading">{user.accountStatusReason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subscription Info for regular users */}
                                    {user.role === "user" && user.subscription && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-heading mb-3">Subscription Details</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-primary">{user.subscription.status || "None"}</div>
                                                    <div className="text-xs text-muted">Status</div>
                                                </div>
                                                {user.subscription.freeTrialUsed && (
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-green-600">Used</div>
                                                        <div className="text-xs text-muted">Free Trial</div>
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-blue-600">{user.subscription.adUnlockCredits || 0}</div>
                                                    <div className="text-xs text-muted">Ad Credits</div>
                                                </div>
                                                {user.subscription.startDate && (
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-purple-600">{formatDate(user.subscription.startDate)}</div>
                                                        <div className="text-xs text-muted">Start Date</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Partner Financial Overview - Only for Partner Role */}
                                {user.role === "partner" && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                            <FiTrendingUp className="w-5 h-5 mr-2" />
                                            Partner Financial Overview
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                                <div className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Commission Rate</div>
                                                <div className="text-xl font-bold text-blue-900">{(user.partnerCommissionRate ? user.partnerCommissionRate * 100 : 90).toFixed(0)}%</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                                <div className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Total Earnings</div>
                                                <div className="text-xl font-bold text-green-600">₹{(user.totalEarnings || 0).toLocaleString()}</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                                <div className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Withdrawn</div>
                                                <div className="text-xl font-bold text-gray-700">₹{(user.withdrawnAmount || 0).toLocaleString()}</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                                <div className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Pending</div>
                                                <div className="text-xl font-bold text-orange-600">₹{(user.pendingWithdrawals || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        {user.lastWithdrawalDate && (
                                            <p className="mt-4 text-xs text-blue-700 font-medium">
                                                Last withdrawal on {formatDate(user.lastWithdrawalDate)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Property Statistics Section */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-heading mb-4 flex items-center">
                                        <FiHome className="w-5 h-5 mr-2 text-primary" />
                                        Property Statistics
                                    </h3>

                                    {propertyStats ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Total Properties */}
                                            <motion.div
                                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-heading">{propertyStats.total}</div>
                                                        <div className="text-sm text-muted">Total Properties</div>
                                                    </div>
                                                    <FiHome className="w-8 h-8 text-primary" />
                                                </div>
                                            </motion.div>

                                            {/* Approved Properties */}
                                            <motion.div
                                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-green-600">{propertyStats.approved}</div>
                                                        <div className="text-sm text-muted">Approved</div>
                                                    </div>
                                                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                                                </div>
                                            </motion.div>

                                            {/* Pending Properties */}
                                            <motion.div
                                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-yellow-600">{propertyStats.pending}</div>
                                                        <div className="text-sm text-muted">Pending</div>
                                                    </div>
                                                    <FiClock className="w-8 h-8 text-yellow-600" />
                                                </div>
                                            </motion.div>

                                            {/* Rejected Properties */}
                                            <motion.div
                                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-2xl font-bold text-red-600">{propertyStats.rejected}</div>
                                                        <div className="text-sm text-muted">Rejected</div>
                                                    </div>
                                                    <FiXCircle className="w-8 h-8 text-red-600" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted">
                                            No property statistics available
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}