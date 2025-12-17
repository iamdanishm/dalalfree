"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiVideo,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiDownload,
} from "react-icons/fi";

const KycVerification = ({
  formData,
  updateFormData,
  errors,
  setErrors,
  onStepChange,
  onPublish,
  isPublishing,
  acceptedTerms,
  setAcceptedTerms,
}) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaar: null,
    pan: null,
    agreement: null,
    video: null,
  });

  // Check KYC status on component mount
  useEffect(() => {
    const checkKycStatus = async () => {
      try {
        const response = await fetch("/api/kyc");
        if (response.ok) {
          const kycData = await response.json();
          setKycStatus(kycData.status || "none");
        } else {
          setKycStatus("none");
        }
      } catch (error) {
        console.error("Error checking KYC status:", error);
        setKycStatus("none");
      } finally {
        setIsLoading(false);
      }
    };

    checkKycStatus();
  }, []);

  const handleFileUpload = (type, file) => {
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: file,
      }));

      // Update form data
      updateFormData({
        kycFiles: {
          ...formData.kycFiles,
          [type]: file,
        },
      });
    }
  };

  const handleVideoRecording = () => {
    // For demo purposes, simulate video recording
    alert("Video recording feature - This is a demo implementation");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <FiAlertCircle className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiFileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
        >
          <FiFileText className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold text-heading">
          KYC Verification Required
        </h1>
        <p className="text-lg text-body max-w-2xl mx-auto">
          To publish your property listing, we need to verify your identity and
          ownership documents. This ensures a safe and trustworthy platform for
          all users.
        </p>
      </div>

      {/* Current KYC Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`p-6 rounded-xl border-2 ${getStatusColor(kycStatus)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(kycStatus)}
            <h3 className="text-lg font-semibold">Current KYC Status</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium capitalize">
            {kycStatus === "none" ? "Not Started" : kycStatus}
          </span>
        </div>

        {kycStatus === "approved" && (
          <p className="text-green-700">
            ✅ Your KYC has been approved! You can now proceed to publish your
            property.
          </p>
        )}

        {kycStatus === "pending" && (
          <p className="text-yellow-700">
            ⏳ Your KYC documents are being reviewed. This usually takes 24-48
            hours.
          </p>
        )}

        {kycStatus === "rejected" && (
          <p className="text-red-700">
            ❌ Your KYC was rejected. Please check your email for details and
            resubmit.
          </p>
        )}

        {kycStatus === "none" && (
          <div className="space-y-4">
            <p className="text-gray-700">
              You haven't submitted your KYC documents yet. Please upload the
              required documents below.
            </p>

            {/* Document Upload Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Aadhaar Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <FiUpload className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-heading">Aadhaar Card</h4>
                </div>
                <p className="text-sm text-body mb-3">
                  Upload a clear photo of your Aadhaar card (front and back)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("aadhaar", e.target.files[0])
                  }
                  className="w-full text-sm"
                />
                {uploadedFiles.aadhaar && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedFiles.aadhaar.name}
                  </p>
                )}
              </motion.div>

              {/* PAN Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <FiUpload className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-heading">PAN Card</h4>
                </div>
                <p className="text-sm text-body mb-3">
                  Upload a clear photo of your PAN card
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("pan", e.target.files[0])}
                  className="w-full text-sm"
                />
                {uploadedFiles.pan && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedFiles.pan.name}
                  </p>
                )}
              </motion.div>

              {/* Property Agreement */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <FiFileText className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-heading">
                    Property Agreement
                  </h4>
                </div>
                <p className="text-sm text-body mb-3">
                  Upload property ownership document or agreement
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleFileUpload("agreement", e.target.files[0])
                  }
                  className="w-full text-sm"
                />
                {uploadedFiles.agreement && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedFiles.agreement.name}
                  </p>
                )}
              </motion.div>

              {/* Video Verification */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <FiVideo className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-heading">
                    Video Verification
                  </h4>
                </div>
                <p className="text-sm text-body mb-3">
                  Record a short video introducing yourself and confirming
                  ownership
                </p>
                <button
                  onClick={handleVideoRecording}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Recording
                </button>
                {uploadedFiles.video && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Video recorded successfully
                  </p>
                )}
              </motion.div>
            </div>

            {/* Submit KYC Button */}
            <div className="mt-6 text-center">
              <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Submit KYC Documents
              </button>
              <p className="text-sm text-body mt-2">
                Documents will be reviewed within 24-48 hours
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <FiEye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">
              Why KYC Verification?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Ensures only genuine property owners can list properties
              </li>
              <li>• Protects buyers from fraudulent listings</li>
              <li>• Maintains trust and transparency on the platform</li>
              <li>
                • Complies with legal requirements for property transactions
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Demo Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
      >
        <div className="flex items-center space-x-2 text-yellow-800">
          <FiAlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Demo Implementation</span>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          This is a demo version of the KYC verification step. In the full
          implementation, users would upload real documents and complete video
          verification.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default KycVerification;
