"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiPhone, FiShield, FiEdit, FiLock } from "react-icons/fi";
import Select from "react-select";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useSession } from "next-auth/react";

export default function EditUserModal({ isOpen, onClose, onSubmit, loading, serverErrors, userData }) {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    accountStatus: "active",
    accountStatusReason: "",
    reraNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialStatus, setInitialStatus] = useState("active");

  // Check if user is editing themselves (prevent admin self-changes)
  const isEditingSelf = userData && session?.user?.id === userData._id;
  const canChangeStatus = !isEditingSelf || session?.user?.role !== "admin";
  const canChangeRole = !isEditingSelf || session?.user?.role !== "admin";

  // Merge server errors with client errors
  const combinedErrors = { ...errors };
  if (serverErrors) {
    Object.keys(serverErrors).forEach(field => {
      if (serverErrors[field]) {
        combinedErrors[field] = serverErrors[field];
      }
    });
  }

  // Helper function to convert display role back to raw role
  const getRawRole = (displayRole) => {
    switch (displayRole) {
      case "User": return "user";
      case "Partner": return "partner";
      case "Sub-Admin": return "sub-admin";
      case "Admin": return "admin";
      default: return displayRole?.toLowerCase() || "user";
    }
  };

  // Reset form when modal closes or user data changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "user",
        accountStatus: "active",
        accountStatusReason: "",
        reraNumber: "",
      });
      setErrors({});
      setTouched({});
      setInitialStatus("active");
    } else if (userData) {
      // Pre-populate form with user data
      const initialData = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        role: getRawRole(userData.role) || "user", // Convert display role to raw role
        accountStatus: userData.accountStatus || userData.status || "active",
        accountStatusReason: userData.accountStatusReason || "",
        reraNumber: userData.reraNumber || "",
      };
      setFormData(initialData);
      setInitialStatus(initialData.accountStatus);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, userData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
          newErrors.phone = "Please enter a valid phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      case "reraNumber":
        if (formData.role === "partner" && !value.trim()) {
          newErrors.reraNumber = "RERA number is required for partners";
        } else {
          delete newErrors.reraNumber;
        }
        break;

      case "accountStatusReason":
        // Optional field, no validation required
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // RERA validation for partners
    if (formData.role === "partner" && !formData.reraNumber.trim()) {
      newErrors.reraNumber = "RERA number is required for partners";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields synchronously
    const validationErrors = validateAllFields();

    // Update errors state and mark all fields as touched
    setErrors(validationErrors);
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      reraNumber: true,
      accountStatusReason: true
    };
    setTouched(allTouched);

    // Check if there are any errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Prepare data for submission - only include changed fields
    const submitData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: formData.role,
      accountStatus: formData.accountStatus,
    };

    // Add RERA number only for partners
    if (formData.role === "partner") {
      submitData.reraNumber = formData.reraNumber.trim();
    }

    // Add status reason only if status changed and reason provided
    if (formData.accountStatus !== initialStatus && formData.accountStatusReason.trim()) {
      submitData.accountStatusReason = formData.accountStatusReason.trim();
    }

    onSubmit(submitData);
  };

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "partner", label: "Partner" },
    { value: "sub-admin", label: "Sub-Admin" },
    { value: "admin", label: "Admin" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "pending", label: "Pending" },
  ];

  const showStatusReason = formData.accountStatus !== initialStatus &&
    (formData.accountStatus === "suspended" || formData.accountStatus === "pending");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-heading flex items-center">
                  <FiEdit className="w-5 h-5 mr-2 text-primary" />
                  Edit User
                </h2>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                        <FiUser className="w-4 h-4 mr-2 text-primary" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-surface ${
                          errors.name && touched.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-border focus:border-primary"
                        }`}
                        placeholder="Enter full name"
                      />
                      {combinedErrors.name && touched.name && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {combinedErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                        <FiMail className="w-4 h-4 mr-2 text-primary" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-surface ${
                          errors.email && touched.email
                            ? "border-red-300 focus:border-red-500"
                            : "border-border focus:border-primary"
                        }`}
                        placeholder="Enter email address"
                      />
                      {combinedErrors.email && touched.email && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {combinedErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                        <FiShield className="w-4 h-4 mr-2 text-primary" />
                        User Role *
                        {!canChangeRole && (
                          <FiLock className="w-4 h-4 ml-2 text-gray-400" title="You cannot change your own role" />
                        )}
                      </label>
                      <Select
                        value={roleOptions.find(option => option.value === formData.role)}
                        onChange={(selectedOption) => handleInputChange("role", selectedOption.value)}
                        options={roleOptions}
                        className="w-full"
                        classNamePrefix="react-select"
                        isDisabled={!canChangeRole}
                        menuPortalTarget={document.body}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            padding: "0.25rem",
                            minHeight: "48px",
                            boxShadow: "none",
                            backgroundColor: state.isDisabled ? "#f9fafb" : "var(--color-surface)",
                            opacity: state.isDisabled ? 0.6 : 1,
                            cursor: state.isDisabled ? "not-allowed" : "pointer",
                            "&:hover": {
                              border: state.isDisabled ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                            },
                            "&:focus-within": {
                              borderColor: state.isDisabled ? "#e5e7eb" : "var(--color-primary)",
                              borderWidth: state.isDisabled ? "1px" : "2px",
                              boxShadow: state.isDisabled ? "none" : "0 0 0 2px rgba(var(--color-primary), 0.5)",
                            },
                          }),
                          singleValue: (provided, state) => ({
                            ...provided,
                            color: state.isDisabled ? "#6b7280" : "#374151",
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
                      {!canChangeRole && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <FiLock className="w-4 h-4 mr-1" />
                          You cannot change your own role
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                        <FiPhone className="w-4 h-4 mr-2 text-primary" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-surface ${
                          errors.phone && touched.phone
                            ? "border-red-300 focus:border-red-500"
                            : "border-border focus:border-primary"
                        }`}
                        placeholder="Enter phone number"
                      />
                      {combinedErrors.phone && touched.phone && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                          {combinedErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Account Status */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                        <FiShield className="w-4 h-4 mr-2 text-primary" />
                        Account Status *
                        {!canChangeStatus && (
                          <FiLock className="w-4 h-4 ml-2 text-gray-400" title="You cannot change your own status" />
                        )}
                      </label>
                      <Select
                        value={statusOptions.find(option => option.value === formData.accountStatus)}
                        onChange={(selectedOption) => handleInputChange("accountStatus", selectedOption.value)}
                        options={statusOptions}
                        className="w-full"
                        classNamePrefix="react-select"
                        isDisabled={!canChangeStatus}
                        menuPortalTarget={document.body}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            padding: "0.25rem",
                            minHeight: "48px",
                            boxShadow: "none",
                            backgroundColor: state.isDisabled ? "#f9fafb" : "var(--color-surface)",
                            opacity: state.isDisabled ? 0.6 : 1,
                            cursor: state.isDisabled ? "not-allowed" : "pointer",
                            "&:hover": {
                              border: state.isDisabled ? "1px solid #e5e7eb" : "1px solid #e5e7eb",
                            },
                            "&:focus-within": {
                              borderColor: state.isDisabled ? "#e5e7eb" : "var(--color-primary)",
                              borderWidth: state.isDisabled ? "1px" : "2px",
                              boxShadow: state.isDisabled ? "none" : "0 0 0 2px rgba(var(--color-primary), 0.5)",
                            },
                          }),
                          singleValue: (provided, state) => ({
                            ...provided,
                            color: state.isDisabled ? "#6b7280" : "#374151",
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
                      {!canChangeStatus && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <FiLock className="w-4 h-4 mr-1" />
                          You cannot change your own account status
                        </p>
                      )}
                    </div>

                    {/* RERA Number - Conditional */}
                    <AnimatePresence>
                      {formData.role === "partner" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div>
                            <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                              <FiShield className="w-4 h-4 mr-2 text-primary" />
                              RERA Number *
                            </label>
                            <input
                              type="text"
                              value={formData.reraNumber}
                              onChange={(e) => handleInputChange("reraNumber", e.target.value)}
                              onBlur={() => handleBlur("reraNumber")}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-surface ${
                                errors.reraNumber && touched.reraNumber
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-border focus:border-primary"
                              }`}
                              placeholder="Enter RERA registration number"
                            />
                            {combinedErrors.reraNumber && touched.reraNumber && (
                              <p className="text-red-600 text-sm mt-2 flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                {combinedErrors.reraNumber}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Status Reason - Conditional */}
                    <AnimatePresence>
                      {showStatusReason && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div>
                            <label className="block text-sm font-medium text-heading mb-3 flex items-center">
                              <FiShield className="w-4 h-4 mr-2 text-primary" />
                              Status Change Reason
                            </label>
                            <textarea
                              value={formData.accountStatusReason}
                              onChange={(e) => handleInputChange("accountStatusReason", e.target.value)}
                              onBlur={() => handleBlur("accountStatusReason")}
                              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-surface resize-none"
                              placeholder="Enter reason for status change (optional)"
                              rows={3}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-border rounded-lg text-body hover:bg-surface transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      "Update User"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}