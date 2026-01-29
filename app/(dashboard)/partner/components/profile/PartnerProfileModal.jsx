"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone, FiShield, FiEdit, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useToast } from "@/app/lib/hooks/useToast";

import { useSession } from "next-auth/react";

export default function PartnerProfileModal({ isOpen, onClose }) {
    const { success, error: showError } = useToast();
    const { update } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit form states
    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        } else {
            setIsEditing(false);
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/users/profile");
            const data = await response.json();
            if (response.ok) {
                setUser(data.user);
                setFormData({
                    name: data.user.name || "",
                    phone: data.user.phone || ""
                });
            } else {
                setError(data.error || "Failed to fetch profile");
            }
        } catch (err) {
            setError("An error occurred while fetching profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                // Update next-auth session
                await update({
                    name: data.user.name,
                    phone: data.user.phone,
                });

                success("Profile updated successfully");
                setUser(data.user);
                setIsEditing(false);
            } else {
                showError(data.error || "Failed to update profile");
            }
        } catch (err) {
            showError("An error occurred while updating profile");
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case "admin": return "bg-purple-100 text-purple-800";
            case "partner": return "bg-blue-100 text-blue-800";
            case "user": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-heading">My Profile</h2>
                                <p className="text-sm text-muted">Manage your partner account information</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            <FiX className="w-5 h-5 text-muted" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
                        {loading ? (
                            <div className="py-12 text-center">
                                <FiLoader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted">Loading profile details...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-red-600 font-medium">{error}</p>
                                <button onClick={fetchProfile} className="mt-4 text-primary hover:underline">Try Again</button>
                            </div>
                        ) : user ? (
                            <form onSubmit={handleUpdate} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiUser className="mr-2 text-primary" /> Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="Enter your name"
                                                required
                                            />
                                        ) : (
                                            <p className="px-4 py-3 rounded-xl bg-gray-50 border border-transparent text-heading font-medium">
                                                {user.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Field - Always Non-Editable */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiMail className="mr-2 text-primary" /> Email Address
                                        </label>
                                        <p className="px-4 py-3 rounded-xl bg-gray-50 border border-transparent text-muted font-medium opacity-70">
                                            {user.email}
                                        </p>
                                        <p className="text-[10px] text-muted ml-1 italic">* Email cannot be changed</p>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiPhone className="mr-2 text-primary" /> Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <p className="px-4 py-3 rounded-xl bg-gray-50 border border-transparent text-heading font-medium">
                                                {user.phone || "Not provided"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Role Field - Non-Editable */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiShield className="mr-2 text-primary" /> Account Role
                                        </label>
                                        <div className="flex items-center px-4 py-3 rounded-xl bg-gray-50 border border-transparent">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* RERA Number - Non-Editable as requested */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiShield className="mr-2 text-primary" /> RERA Number
                                        </label>
                                        <p className="px-4 py-3 rounded-xl bg-gray-50 border border-transparent text-muted font-medium opacity-70">
                                            {user.reraNumber || "N/A"}
                                        </p>
                                    </div>

                                    {/* Commission Rate - Non-Editable */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-heading flex items-center">
                                            <FiShield className="mr-2 text-primary" /> Commission Rate
                                        </label>
                                        <p className="px-4 py-3 rounded-xl bg-gray-50 border border-transparent text-heading font-medium">
                                            {(user.partnerCommissionRate * 100 || 90).toFixed(0)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Financial Overview</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-xs text-muted font-semibold mb-1">Total Earnings</p>
                                            <p className="text-lg font-black text-heading">₹{(user.totalEarnings || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted font-semibold mb-1">Pending</p>
                                            <p className="text-lg font-black text-orange-600">₹{(user.pendingWithdrawals || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted font-semibold mb-1">Withdrawn</p>
                                            <p className="text-lg font-black text-green-600">₹{(user.withdrawnAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    {isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 rounded-xl border border-border text-heading font-semibold hover:bg-gray-50 transition-colors"
                                                disabled={updating}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                                disabled={updating}
                                            >
                                                {updating ? <FiLoader className="animate-spin" /> : <FiCheck />}
                                                Save Changes
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <FiEdit />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
