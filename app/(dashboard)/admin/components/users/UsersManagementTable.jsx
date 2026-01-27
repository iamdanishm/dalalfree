"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/lib/hooks/useToast";
import {
    FiUsers,
    FiSearch,
    FiEdit,
    FiTrash2,
    FiEye,
    FiChevronLeft,
    FiChevronRight,
    FiX,
    FiPlus,
} from "react-icons/fi";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import UserDetailModal from "./UserDetailModal";
import ConfirmationModal from "@/app/components/ConfirmationModal";

export default function UsersManagementTable() {
    const { data: session } = useSession();
    const { success, error: showError } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState({
        value: "",
        label: "All Roles",
    });
    const [statusFilter, setStatusFilter] = useState({
        value: "",
        label: "All Status",
    });

    // Modal states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [editUserLoading, setEditUserLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState({});

    const fetchUsers = async (
        page = 1,
        search = "",
        role = "",
        status = "",
        showLoading = false
    ) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });

            if (search) params.append("search", search);
            if (role) params.append("role", role);
            if (status) params.append("status", status);

            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
                setTotalUsers(data.pagination?.total || 0);
                setTotalPages(data.pagination?.pages || 1);
                setCurrentPage(data.pagination?.page || 1);
            } else {
                setError(data.error || "Failed to fetch users");
            }
        } catch (err) {
            setError("Failed to fetch users");
            console.error("Error fetching users:", err);
        } finally {
            if (showLoading) {
                setLoading(false);
                setInitialLoad(false);
            }
        }
    };

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
            fetchUsers(1, debouncedSearchTerm, roleFilter?.value || "", statusFilter?.value || "");
        }
    }, [debouncedSearchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers(1, "", "", "", true); // Show loading on initial load
    }, []);

    const handlePageChange = (page) => {
        fetchUsers(
            page,
            debouncedSearchTerm,
            roleFilter?.value || "",
            statusFilter?.value || ""
        );
    };

    const handleDeleteUser = (user) => {
        setSelectedUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!selectedUserToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${selectedUserToDelete._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reason: "Suspended by admin",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                success("User suspended successfully!");
                setShowDeleteModal(false);
                setSelectedUserToDelete(null);
                // Refresh the users list
                fetchUsers(
                    currentPage,
                    debouncedSearchTerm,
                    roleFilter?.value || "",
                    statusFilter?.value || ""
                );
            } else {
                throw new Error(data.error || "Failed to suspend user");
            }
        } catch (error) {
            showError(error.message || "Failed to suspend user");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleAddUser = async (userData) => {
        setAddUserLoading(true);
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                success(`User "${userData.name}" created successfully!`);
                setShowAddUserModal(false);
                setServerErrors({}); // Clear server errors on success
                // Refresh the users list
                fetchUsers(
                    currentPage,
                    debouncedSearchTerm,
                    roleFilter?.value || "",
                    statusFilter?.value || ""
                );
            } else {
                // Handle API validation errors - don't show toast, let modal handle it
                if (data.fieldErrors) {
                    // This is a field-specific validation error, pass to modal
                    setServerErrors(data.fieldErrors);
                } else if (data.missing && Array.isArray(data.missing)) {
                    // Legacy validation error format
                    console.error("Validation error:", data);
                    setServerErrors({ general: data.error || "Validation failed" });
                } else {
                    // Other errors (like email exists) still show as toast
                    setServerErrors({});
                    showError(data.error || "Failed to create user");
                }
            }
        } catch (err) {
            console.error("Error creating user:", err);
            showError("Failed to create user. Please try again.");
        } finally {
            setAddUserLoading(false);
        }
    };

    const handleRowClick = (user) => {
        setSelectedUserId(user._id);
        setShowUserDetailModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowEditUserModal(true);
    };

    const handleEditSubmit = async (userData) => {
        setEditUserLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                success(`User "${userData.name}" updated successfully!`);
                setShowEditUserModal(false);
                setSelectedUser(null);
                setServerErrors({}); // Clear server errors on success
                // Refresh the users list
                fetchUsers(
                    currentPage,
                    debouncedSearchTerm,
                    roleFilter?.value || "",
                    statusFilter?.value || ""
                );
            } else {
                // Handle API validation errors - don't show toast, let modal handle it
                if (data.fieldErrors) {
                    // This is a field-specific validation error, pass to modal
                    setServerErrors(data.fieldErrors);
                } else if (data.missing && Array.isArray(data.missing)) {
                    // Legacy validation error format
                    console.error("Validation error:", data);
                    setServerErrors({ general: data.error || "Validation failed" });
                } else {
                    // Other errors (like email exists) still show as toast
                    setServerErrors({});
                    showError(data.error || "Failed to update user");
                }
            }
        } catch (err) {
            console.error("Error updating user:", err);
            showError("Failed to update user. Please try again.");
        } finally {
            setEditUserLoading(false);
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

    if (loading && users.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-soft border border-border p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted">Loading users...</span>
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
                        <FiUsers className="w-5 h-5 mr-2 text-primary" />
                        User Management
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted">Total: {totalUsers} users</div>
                        <motion.button
                            onClick={() => setShowAddUserModal(true)}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-soft"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiPlus className="w-4 h-4 mr-2" />
                            Add User
                        </motion.button>
                    </div>
                </div>

                {/* Filters */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="relative flex-1"
                    >
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, phone..."
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
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="relative"
                    >
                        <Select
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={[
                                { value: "", label: "All Roles" },
                                { value: "user", label: "User" },
                                { value: "partner", label: "Partner" },
                                { value: "sub-admin", label: "Sub-Admin" },
                                { value: "admin", label: "Admin" },
                            ]}
                            placeholder="All Roles"
                            className="w-full"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "0.5rem",
                                    padding: "0.25rem",
                                    minHeight: "48px",
                                    boxShadow: "none",
                                    "&:hover": {
                                        border: "1px solid #e5e7eb",
                                    },
                                    "&:focus-within": {
                                        borderColor: "var(--color-primary)",
                                        borderWidth: "3px",
                                        boxShadow: "0 0 0 2px rgba(var(--color-primary), 0.5)",
                                    },
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: "#374151",
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: "#9ca3af",
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                        ? "var(--color-primary)"
                                        : state.isFocused
                                            ? "#f3f4f6"
                                            : "white",
                                    color: state.isSelected ? "white" : "#374151",
                                    cursor: "pointer",
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    borderRadius: "0.5rem",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    zIndex: 9999,
                                }),
                                menuPortal: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                }),
                            }}
                            components={{
                                DropdownIndicator: () => (
                                    <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                                ),
                            }}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="relative"
                    >
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "", label: "All Status" },
                                { value: "active", label: "Active" },
                                { value: "suspended", label: "Suspended" },
                                { value: "pending", label: "Pending" },
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
                                    minHeight: "48px",
                                    boxShadow: "none",
                                    "&:hover": {
                                        border: "1px solid #e5e7eb",
                                    },
                                    "&:focus-within": {
                                        borderColor: "var(--color-primary)",
                                        borderWidth: "3px",
                                        boxShadow: "0 0 0 2px rgba(var(--color-primary), 0.5)",
                                    },
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: "#374151",
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: "#9ca3af",
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                        ? "var(--color-primary)"
                                        : state.isFocused
                                            ? "#f3f4f6"
                                            : "white",
                                    color: state.isSelected ? "white" : "#374151",
                                    cursor: "pointer",
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    borderRadius: "0.5rem",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                    zIndex: 9999,
                                }),
                                menuPortal: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                }),
                            }}
                            components={{
                                DropdownIndicator: () => (
                                    <MdKeyboardArrowDown className="text-gray-400 mr-2" />
                                ),
                            }}
                        />
                    </motion.div>
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
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user, index) => (
                                <motion.tr
                                    key={user._id || index}
                                    className="hover:bg-surface transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(user)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-heading">
                                                    {user.name || "Unnamed"}
                                                </div>
                                                <div className="text-sm text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                                                user.role
                                            )}`}
                                        >
                                            {user.role === "user"
                                                ? "User"
                                                : user.role === "partner"
                                                    ? "Partner"
                                                    : user.role === "sub-admin"
                                                        ? "Sub-Admin"
                                                        : user.role === "admin"
                                                            ? "Admin"
                                                            : user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                user.status
                                            )}`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body">
                                        {user.phone || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-orange-600 hover:text-orange-800 p-1"
                                                title="Edit User"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click
                                                    handleEditUser(user);
                                                }}
                                            >
                                                <FiEdit className="w-4 h-4" />
                                            </button>
                                            {/* Only show suspend button for other users, not for current admin, and not for suspended users */}
                                            {user._id !== session?.user?.id && user.status !== "Suspended" && (
                                                <button
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleDeleteUser(user);
                                                    }}
                                                    title="Suspend User"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
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
                        Showing page {currentPage} of {totalPages} ({totalUsers}{" "}
                        total users)
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
                                        className={`px-3 py-1 border border-border rounded-md ${i === currentPage
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

            {/* Add User Modal */}
            <AddUserModal
                isOpen={showAddUserModal}
                onClose={() => {
                    setShowAddUserModal(false);
                    setServerErrors({}); // Clear server errors when closing
                }}
                onSubmit={handleAddUser}
                loading={addUserLoading}
                serverErrors={serverErrors}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={showEditUserModal}
                onClose={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                    setServerErrors({}); // Clear server errors when closing
                }}
                onSubmit={handleEditSubmit}
                loading={editUserLoading}
                serverErrors={serverErrors}
                userData={selectedUser}
            />

            {/* User Detail Modal */}
            <UserDetailModal
                isOpen={showUserDetailModal}
                onClose={() => {
                    setShowUserDetailModal(false);
                    setSelectedUserId(null);
                }}
                onEdit={handleEditUser}
                userId={selectedUserId}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedUserToDelete(null);
                }}
                onConfirm={confirmDeleteUser}
                title="Suspend User"
                message={`Are you sure you want to suspend "${selectedUserToDelete?.name}"? This action will change their account status to suspended.`}
                confirmText="Suspend"
                cancelText="Cancel"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
                loading={deleteLoading}
            />
        </motion.div>
    );
}
<FiChevronRight className="w-4 h-4" />