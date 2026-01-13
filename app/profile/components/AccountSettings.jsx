"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiLock,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { useToast } from "@/app/lib/hooks/useToast";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AccountSettings({ user, onProfileUpdate }) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { success, error: showError, promise } = useToast();

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength <= 1)
      return { label: "Weak", color: "text-red-600", bgColor: "bg-red-100" };
    if (strength <= 3)
      return {
        label: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return {
      label: "Strong",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    const changePasswordPromise = fetch("/api/users/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
      return response.json();
    });

    try {
      await promise(changePasswordPromise, {
        loading: "Changing password...",
        success: "Password changed successfully!",
        error: (err) => err.message || "Failed to change password",
      });

      // Reset form on success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error is already handled by the promise toast
      console.error("Password change error:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const deletePromise = fetch("/api/users/delete-account", {
      method: "POST",
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }
      return response.json();
    });

    try {
      await promise(deletePromise, {
        loading: "Deleting account...",
        success:
          "Account deletion request submitted. We'll contact you shortly.",
        error: (err) => err.message || "Failed to delete account",
      });

      setShowDeleteConfirmation(false);
      // Optionally redirect to home page or logout
    } catch (error) {
      // Error is already handled by the promise toast
      console.error("Account deletion error:", error);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-200">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Account Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account preferences and security
          </p>
        </motion.div>
      </div>

      <div className="p-6 space-y-6">
        {/* Change Password */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiLock className="text-red-600" size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                    passwordErrors.currentPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter current password"
                  whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {passwordErrors.currentPassword && (
                  <motion.span
                    key="current-password-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-red-500 mt-1 block"
                  >
                    {passwordErrors.currentPassword}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                    passwordErrors.newPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter new password"
                  whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          getPasswordStrengthLabel(
                            calculatePasswordStrength(passwordData.newPassword)
                          ).bgColor
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (calculatePasswordStrength(
                              passwordData.newPassword
                            ) /
                              5) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        getPasswordStrengthLabel(
                          calculatePasswordStrength(passwordData.newPassword)
                        ).color
                      }`}
                    >
                      {
                        getPasswordStrengthLabel(
                          calculatePasswordStrength(passwordData.newPassword)
                        ).label
                      }
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Password should include uppercase, lowercase, numbers, and
                    special characters
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {passwordErrors.newPassword && (
                  <motion.span
                    key="new-password-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-red-500 mt-1 block"
                  >
                    {passwordErrors.newPassword}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${
                    passwordErrors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {passwordErrors.confirmPassword && (
                  <motion.span
                    key="confirm-password-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-red-500 mt-1 block"
                  >
                    {passwordErrors.confirmPassword}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              animate={isChangingPassword ? "loading" : "idle"}
            >
              <motion.span
                key={isChangingPassword ? "loading" : "idle"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isChangingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </motion.span>
            </motion.button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiTrash2 className="text-red-600" size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>

            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, properties, and account information."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </motion.div>
  );
}
