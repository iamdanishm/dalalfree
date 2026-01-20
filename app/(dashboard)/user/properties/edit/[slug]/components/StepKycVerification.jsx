"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiVideo,
  FiFileText,
  FiAlertCircle,
  FiEye,
  FiTrash2,
  FiCamera,
  FiFile,
  FiShield,
  FiLock,
} from "react-icons/fi";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (matches API)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]; // Matches API
const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]; // Matches API
const ALLOWED_PDF_ONLY = ["application/pdf"];
const ALLOWED_PAN_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
  "video/mkv",
  "video/flv",
  "video/webm",
]; // Matches API

export default function StepKycVerification({
  formData,
  updateFormData,
  errors,
  setErrors,
  originalProperty,
  isEditing = false,
}) {
  const isApproved = originalProperty?.status === "approved";

  const [isDragOver, setIsDragOver] = useState(false);
  const [localFiles, setLocalFiles] = useState(() => ({
    aadhaar:
      formData.kycFiles?.aadhaar || originalProperty?.kycFiles?.aadhaar || [],
    pan: formData.kycFiles?.pan || originalProperty?.kycFiles?.pan || null,
    agreement:
      formData.kycFiles?.agreement ||
      originalProperty?.kycFiles?.agreement ||
      null,
    video:
      formData.kycFiles?.video || originalProperty?.kycFiles?.video || null,
  }));
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoGuide, setShowVideoGuide] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null);
  const agreementInputRef = useRef(null);

  // Update form data when local files change - but avoid circular dependency
  useEffect(() => {
    // Only update form data if localFiles has actually changed from initial state
    const initialFiles = {
      aadhaar:
        formData.kycFiles?.aadhaar || originalProperty?.kycFiles?.aadhaar || [],
      pan: formData.kycFiles?.pan || originalProperty?.kycFiles?.pan || null,
      agreement:
        formData.kycFiles?.agreement ||
        originalProperty?.kycFiles?.agreement ||
        null,
      video:
        formData.kycFiles?.video || originalProperty?.kycFiles?.video || null,
    };

    const hasChanged =
      JSON.stringify(localFiles) !== JSON.stringify(initialFiles);
    if (hasChanged) {
      updateFormData({ kycFiles: localFiles });
    }
  }, [localFiles]); // Removed updateFormData and formData from dependencies to break circular loop

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (recordingStream) {
        recordingStream.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [recordingStream]); // Added recordingStream as dependency to ensure latest stream is cleaned

  // File validation
  const validateFile = useCallback(
    (file, allowedTypes, maxSize = MAX_FILE_SIZE) => {
      if (file.size > maxSize) {
        setErrors({
          kyc: `File ${file.name} is too large. Max size: ${
            maxSize / (1024 * 1024)
          }MB`,
        });
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          kyc: `File ${
            file.name
          } is not a supported format. Allowed: ${allowedTypes.join(", ")}`,
        });
        return false;
      }
      return true;
    },
    [setErrors]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (type, file) => {
      if (!file) return;

      // Determine allowed types based on document type
      let allowedTypes;
      if (type === "agreement") {
        allowedTypes = ALLOWED_PDF_ONLY;
      } else if (type === "aadhaar") {
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
      } else if (type === "pan") {
        allowedTypes = ALLOWED_PAN_TYPES;
      } else {
        allowedTypes = ALLOWED_IMAGE_TYPES;
      }

      if (!validateFile(file, allowedTypes)) return;

      // Clear any existing errors
      if (errors.kyc) setErrors({ ...errors, kyc: null });

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);

      const fileData = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: objectUrl,
        id: `kyc-${type}-${Date.now()}`,
      };

      // Special handling for Aadhaar - max 2 images or 1 PDF
      if (type === "aadhaar") {
        setLocalFiles((prev) => {
          const currentFiles = Array.isArray(prev.aadhaar) ? prev.aadhaar : [];

          // If uploading PDF, replace all with just the PDF
          if (file.type === "application/pdf") {
            // Revoke old URLs
            currentFiles.forEach((f) => f.url && URL.revokeObjectURL(f.url));
            return { ...prev, aadhaar: [fileData] };
          }

          // If current has PDF, replace with new image
          if (currentFiles.some((f) => f.type === "application/pdf")) {
            currentFiles.forEach((f) => f.url && URL.revokeObjectURL(f.url));
            return { ...prev, aadhaar: [fileData] };
          }

          // If already 2 images, show error
          if (currentFiles.length >= 2) {
            setErrors({
              kyc: "Maximum 2 images allowed for Aadhaar. Remove one first.",
            });
            URL.revokeObjectURL(objectUrl);
            return prev;
          }

          return { ...prev, aadhaar: [...currentFiles, fileData] };
        });
        return;
      }

      setLocalFiles((prev) => ({
        ...prev,
        [type]: fileData,
      }));
    },
    [validateFile, errors, setErrors]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e, type) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(type, files[0]);
      }
    },
    [handleFileUpload]
  );

  // Remove file
  const removeFile = (type) => {
    if (localFiles[type]?.url) {
      URL.revokeObjectURL(localFiles[type].url);
    }
    setLocalFiles((prev) => ({ ...prev, [type]: null }));
  };

  // Video recording functions
  // Modified to accept an existing stream to prevent double-initialization
  const startRecording = async (existingStream = null) => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      setIsRecording(true);
      setIsVideoPlaying(false);
      setRecordingTime(0);

      let stream = existingStream;

      // Only request new media if we don't already have a stream from the modal
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
      }

      setRecordingStream(stream);

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const fileName = `kyc-video-${Date.now()}.${
          mimeType.includes("webm") ? "webm" : "mp4"
        }`;

        setLocalFiles((prev) => ({
          ...prev,
          video: {
            file: blob,
            name: fileName,
            size: blob.size,
            type: mimeType,
            url,
          },
        }));

        // Stop the tracks to turn off camera light immediately
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setRecordingStream(null);
        setIsRecording(false);
        setIsVideoPlaying(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Record start time for accurate timing
      recordingStartTimeRef.current = performance.now();

      // 15-second auto-stop timer using performance.now for accuracy
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (performance.now() - recordingStartTimeRef.current) / 1000
        );
        setRecordingTime(elapsed);

        if (elapsed >= 15) {
          stopRecording();
        }
      }, 100); // Update every 100ms for smooth display
    } catch (error) {
      console.error("Camera error:", error);
      const messages = {
        NotAllowedError: "Camera access denied. Please allow permissions.",
        NotFoundError: "No camera found on this device.",
        NotReadableError: "Camera is in use by another app.",
      };
      setErrors({ kyc: messages[error.name] || "Unable to access camera." });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // Stop tracks on the active recording stream
    if (recordingStream) {
      recordingStream.getTracks().forEach((track) => track.stop());
      setRecordingStream(null);
    }

    // Clear video element source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // States are cleaned up in mediaRecorder.onstop, but strictly setting these here helps UI responsiveness
    setIsVideoPlaying(false);
    setRecordingTime(0);
  };

  // Get file type icon
  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) return <FiFile className="w-5 h-5" />;
    if (type?.startsWith("video/")) return <FiVideo className="w-5 h-5" />;
    if (type === "application/pdf") return <FiFileText className="w-5 h-5" />;
    return <FiFile className="w-5 h-5" />;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-heading mb-2">
          KYC Verification
        </h1>
        <p className="text-muted text-lg">
          {isApproved
            ? "Review your verification documents"
            : "Update your verification documents"}
        </p>
        {isApproved && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
            <div className="flex items-center gap-2 text-amber-800">
              <FiLock size={16} />
              <span className="text-sm font-medium">
                KYC documents cannot be modified (approved property)
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Aadhaar Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  isApproved
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}
              >
                <FiFileText className="text-white" size={18} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading">
                  Aadhaar Card
                </h4>
                <p className="text-sm text-muted">
                  {isApproved
                    ? "Document uploaded"
                    : "Upload 2 images (front & back) or 1 PDF"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Show uploaded files */}
              {localFiles.aadhaar?.length > 0 && (
                <div className="space-y-2">
                  {localFiles.aadhaar.map((file, index) => (
                    <div
                      key={file.id || `aadhaar-${index}`}
                      className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${
                        isApproved ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-heading truncate">
                            {file.type === "application/pdf"
                              ? file.name
                              : `${index === 0 ? "Front" : "Back"}: ${
                                  file.name
                                }`}
                          </p>
                          <p className="text-xs text-muted">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        {!isApproved && (
                          <button
                            onClick={() => {
                              URL.revokeObjectURL(file.url);
                              setLocalFiles((prev) => ({
                                ...prev,
                                aadhaar: prev.aadhaar.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show upload area if can add more and not approved */}
              {!isApproved &&
                (() => {
                  const files = localFiles.aadhaar || [];
                  const hasPdf = files.some(
                    (f) => f.type === "application/pdf"
                  );
                  const canAddMore = !hasPdf && files.length < 2;

                  if (files.length === 0 || canAddMore) {
                    return (
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 md:p-4 text-center transition-all duration-200 cursor-pointer min-h-[120px] md:min-h-[80px] flex flex-col justify-center ${
                          isDragOver
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "aadhaar")}
                        onClick={() => aadhaarInputRef.current?.click()}
                      >
                        <input
                          ref={aadhaarInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            handleFileUpload("aadhaar", e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                        <FiUpload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-sm text-gray-600">
                          {files.length === 0
                            ? "Upload front & back images or PDF"
                            : "Add back side image"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {files.length === 0
                            ? "Max 2 images or 1 PDF (10MB each)"
                            : "JPG, PNG, WebP (Max 10MB)"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>
          </div>
        </motion.div>

        {/* PAN Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  isApproved
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
              >
                <FiFileText className="text-white" size={18} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading">PAN Card</h4>
                <p className="text-sm text-muted">
                  {isApproved ? "Document uploaded" : "Upload 1 image or PDF"}
                </p>
              </div>
            </div>

            {localFiles.pan ? (
              <div
                className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${
                  isApproved ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(localFiles.pan.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">
                      {localFiles.pan.name}
                    </p>
                    <p className="text-xs text-muted">
                      {(localFiles.pan.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!isApproved && (
                    <button
                      onClick={() => removeFile("pan")}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              !isApproved && (
                <div
                  className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-200 cursor-pointer min-h-[120px] flex flex-col justify-center ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "pan")}
                  onClick={() => panInputRef.current?.click()}
                >
                  <input
                    ref={panInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      handleFileUpload("pan", e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, PDF (Max 10MB)
                  </p>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Property Agreement */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  isApproved
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-purple-500 to-purple-600"
                }`}
              >
                <FiShield className="text-white" size={18} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading">
                  Property Agreement
                </h4>
                <p className="text-sm text-muted">
                  {isApproved
                    ? "Document uploaded"
                    : "Upload PDF document only"}
                </p>
              </div>
            </div>

            {localFiles.agreement ? (
              <div
                className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${
                  isApproved ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(localFiles.agreement.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">
                      {localFiles.agreement.name}
                    </p>
                    <p className="text-xs text-muted">
                      {(localFiles.agreement.size / (1024 * 1024)).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                  {!isApproved && (
                    <button
                      onClick={() => removeFile("agreement")}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              !isApproved && (
                <div
                  className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-200 cursor-pointer min-h-[120px] flex flex-col justify-center ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "agreement")}
                  onClick={() => agreementInputRef.current?.click()}
                >
                  <input
                    ref={agreementInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      handleFileUpload("agreement", e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF only (Max 10MB)
                  </p>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Video Verification */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  isApproved
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              >
                <FiVideo className="text-white" size={18} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-heading">
                  Video Verification
                </h4>
                <p className="text-sm text-muted">
                  {isApproved
                    ? "Video uploaded"
                    : "Record yourself confirming ownership"}
                </p>
              </div>
            </div>

            {localFiles.video ? (
              <div
                className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${
                  isApproved ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <FiVideo className="w-5 h-5 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">
                      {localFiles.video.name}
                    </p>
                    <p className="text-xs text-muted">
                      {(localFiles.video.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  {!isApproved && (
                    <button
                      onClick={() => removeFile("video")}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={localFiles.video.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              !isApproved && (
                <div className="space-y-4">
                  {!isRecording && countdown === 0 ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 md:p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary hover:bg-gray-50 min-h-[140px] flex flex-col justify-center"
                      onClick={() => setShowVideoGuide(true)}
                    >
                      <FiCamera className="mx-auto h-10 w-10 md:h-8 md:w-8 text-gray-400 mb-3 md:mb-2" />
                      <p className="text-base md:text-sm text-gray-600 mb-2 font-medium">
                        Click to start recording
                      </p>
                      <p className="text-sm md:text-xs text-gray-500">
                        Introduce yourself and confirm property ownership
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`border-2 rounded-lg p-4 ${
                        countdown > 0
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-red-300 bg-red-50"
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            onPlaying={() => setIsVideoPlaying(true)}
                            onLoadedMetadata={() => setIsVideoPlaying(true)}
                            className="w-full h-full object-cover"
                          />
                          {/* Countdown overlay */}
                          {countdown > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <div className="text-center">
                                <p className="text-6xl font-bold text-white animate-pulse">
                                  {countdown}
                                </p>
                                <p className="text-white mt-2">Get ready...</p>
                              </div>
                            </div>
                          )}
                          {/* Recording overlay */}
                          {isRecording && countdown === 0 && (
                            <>
                              <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-full">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-white text-xs font-medium">
                                  {recordingTime}s / 15s
                                </span>
                              </div>
                              {!isVideoPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black">
                                  <div className="text-center text-white">
                                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                                    <p className="text-sm">
                                      Starting camera...
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {/* Stop recording button */}
                        {isRecording && countdown === 0 && (
                          <div className="text-center">
                            <button
                              onClick={stopRecording}
                              className="px-8 py-3 md:px-6 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-lg md:text-base"
                            >
                              ⏹️ Stop Recording
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Information Section */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-6"
      >
        <div className="flex items-start space-x-4 md:space-x-3">
          <FiEye className="w-6 h-6 md:w-5 md:h-5 text-blue-600 mt-1 md:mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-3 md:mb-2 text-lg md:text-base">
              Why KYC Verification?
            </h4>
            <ul className="text-base md:text-sm text-blue-800 space-y-2 md:space-y-1 leading-relaxed">
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

      {/* Error Display */}
      {errors.kyc && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 md:p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <p className="text-red-700 text-base md:text-sm font-medium leading-relaxed">
              {errors.kyc}
            </p>
          </div>
        </motion.div>
      )}

      {/* Video Guide Modal */}
      {showVideoGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6 md:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-6 md:mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiVideo className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Video Recording Guidelines
              </h3>
            </div>

            <div className="space-y-4 md:space-y-4 text-sm text-gray-600">
              <div className="bg-blue-50 rounded-lg p-4 md:p-3">
                <p className="font-medium text-blue-900 mb-2 text-base md:text-sm">
                  📝 What to Say:
                </p>
                <ul className="space-y-2 md:space-y-1 text-blue-800 text-base md:text-sm">
                  <li>• State your full name</li>
                  <li>• Confirm you are the owner of this property</li>
                  <li>• Mention the property address briefly</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4 md:p-3">
                <p className="font-medium text-green-900 mb-2 text-base md:text-sm">
                  👔 Appearance:
                </p>
                <ul className="space-y-2 md:space-y-1 text-green-800 text-base md:text-sm">
                  <li>• Dress appropriately (formal/semi-formal)</li>
                  <li>• Face should be clearly visible</li>
                  <li>• Remove sunglasses or masks</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 md:p-3">
                <p className="font-medium text-yellow-900 mb-2 text-base md:text-sm">
                  🏠 Surroundings:
                </p>
                <ul className="space-y-2 md:space-y-1 text-yellow-800 text-base md:text-sm">
                  <li>• Choose a quiet, well-lit area</li>
                  <li>• Ensure clean background</li>
                  <li>• Minimize background noise</li>
                </ul>
              </div>

              <p className="text-center text-gray-500 text-sm md:text-xs">
                Recording will be 15 seconds maximum
              </p>
            </div>

            <div className="flex gap-3 mt-8 md:mt-6">
              <button
                onClick={() => setShowVideoGuide(false)}
                className="flex-1 px-6 py-3 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base md:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowVideoGuide(false);
                  try {
                    // Start camera first
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: { facingMode: "user" },
                      audio: true,
                    });

                    // Set stream for preview during countdown
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                    }

                    // Save stream to state so it can be cleaned up if component unmounts
                    setRecordingStream(stream);

                    // Start 3 second countdown
                    setCountdown(3);
                    const countdownInterval = setInterval(() => {
                      setCountdown((prev) => {
                        if (prev <= 1) {
                          clearInterval(countdownInterval);
                          // PASS THE EXISTING STREAM to startRecording to avoid double initialization
                          startRecording(stream);
                          return 0;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  } catch (error) {
                    console.error("Camera error:", error);
                    setErrors({
                      kyc: "Camera access denied. Please allow permissions.",
                    });
                  }
                }}
                className="flex-1 px-6 py-3 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-base md:text-sm"
              >
                🎬 Start Recording
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
