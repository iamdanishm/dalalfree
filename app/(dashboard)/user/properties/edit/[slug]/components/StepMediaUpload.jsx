/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiImage,
  FiVideo,
  FiAlertCircle,
  FiTrash2,
  FiPlay,
  FiEye,
  FiRotateCcw,
  FiX,
  FiEdit3,
} from "react-icons/fi";
import { validateFileRealTime } from "@/app/lib/propertyHelpers";

const MAX_IMAGES = 20;
const MAX_VIDEOS = 5;
const MAX_FILE_SIZE_IMAGES = 10 * 1024 * 1024; // 10MB for images
const MAX_FILE_SIZE_VIDEOS = 100 * 1024 * 1024; // 100MB for videos (matches API)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/tiff",
  "image/tif",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
  "video/mkv",
  "video/flv",
  "video/webm",
];

export default function StepMediaUpload({
  formData,
  updateFormData,
  errors,
  setErrors,
  originalProperty,
  isEditing = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [playingVideo, setPlayingVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalUploadSize, setTotalUploadSize] = useState(0);

  // Initialize state once from props.
  const [localImages, setLocalImages] = useState([]);
  const [localVideos, setLocalVideos] = useState([]);

  const fileInputRef = useRef(null);

  // Sync local state with formData when navigating between steps (only when formData changes externally)
  useEffect(() => {
    const currentImages = formData.images || [];
    const currentVideos = formData.videos || [];
    const existingImages = formData.existingImages || [];
    const existingVideos = formData.existingVideos || [];
    const removedImages = formData.removedImages || [];
    const removedVideos = formData.removedVideos || [];

    // Create unified arrays: existing + new, excluding removed
    // Filter existing images to ensure only image URLs are included
    const filteredExistingImages = existingImages
      .filter(
        (img) =>
          img &&
          img.url &&
          !removedImages.includes(img.url) &&
          img.url.includes("/images/")
      )
      .map((img) => ({
        id: img.id || img._id || `existing-img-${img.url.split('/').pop()}`,
        url: img.url,
        type: "existing",
        name: img.name || "Existing image",
        order: img.order || 0,
      }));

    // Filter existing videos to ensure only video URLs are included
    const filteredExistingVideos = existingVideos
      .filter(
        (vid) =>
          vid &&
          vid.url &&
          !removedVideos.includes(vid.url) &&
          vid.url.includes("/videos/")
      )
      .map((vid) => ({
        id: vid.id || vid._id || `existing-vid-${vid.url.split('/').pop()}`,
        url: vid.url,
        type: "existing",
        name: vid.name || "Existing video",
        order: vid.order || 0,
      }));

    const allImages = [...filteredExistingImages, ...currentImages];
    const allVideos = [...filteredExistingVideos, ...currentVideos];

    // Only update if different to prevent infinite loops
    const localImageIds = localImages.map((i) => i.id).sort();
    const allImageIds = allImages.map((i) => i.id).sort();
    const imagesDifferent =
      JSON.stringify(localImageIds) !== JSON.stringify(allImageIds);

    const localVideoIds = localVideos.map((v) => v.id).sort();
    const allVideoIds = allVideos.map((v) => v.id).sort();
    const videosDifferent =
      JSON.stringify(localVideoIds) !== JSON.stringify(allVideoIds);

    if (imagesDifferent) {
      setLocalImages(allImages);
    }
    if (videosDifferent) {
      setLocalVideos(allVideos);
    }
  }, [
    formData.images,
    formData.videos,
    formData.existingImages,
    formData.existingVideos,
    formData.removedImages,
    formData.removedVideos,
  ]);

  // Cleanup memory leaks on unmount
  useEffect(() => {
    return () => {
      localImages.forEach((img) => {
        if (img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
      localVideos.forEach((vid) => {
        if (vid.url && vid.url.startsWith("blob:")) {
          URL.revokeObjectURL(vid.url);
        }
      });
    };
  }, []);

  // Check for changes from original data
  const hasChanges = useMemo(() => {
    if (!originalProperty) return false;

    const originalImages = originalProperty.images || [];
    const originalVideos = originalProperty.videos || [];
    const currentImages = formData.existingImages || [];
    const currentVideos = formData.existingVideos || [];

    const hasNewImages = (formData.images || []).length > 0;
    const hasNewVideos = (formData.videos || []).length > 0;
    const hasRemovedImages = (formData.removedImages || []).length > 0;
    const hasRemovedVideos = (formData.removedVideos || []).length > 0;

    return hasNewImages || hasNewVideos || hasRemovedImages || hasRemovedVideos;
  }, [formData, originalProperty]);

  // Real-time validation with warnings
  const validateFileLocally = useCallback(
    (file) => {
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      const validation = validateFileRealTime(file, fileType);

      // Show errors immediately
      if (!validation.isValid) {
        setErrors({
          media: validation.errors.join(", "),
        });
      }

      // Show warnings (non-blocking)
      if (validation.warnings.length > 0) {
        // Could show toast notifications or inline warnings here
        console.warn(
          `File warning for ${file.name}:`,
          validation.warnings.join(", ")
        );
      }

      return validation.isValid;
    },
    [setErrors]
  );

  // Process Files
  const handleFiles = useCallback(
    (files) => {
      if (errors.media) setErrors({ ...errors, media: null });

      const newImages = [];
      const newVideos = [];

      const currentImageCount = localImages.length;
      const currentVideoCount = localVideos.length;

      let imgCount = 0;
      let vidCount = 0;

      for (const file of files) {
        if (!validateFileLocally(file)) continue;

        // Create object URL immediately
        const objectUrl = URL.createObjectURL(file);

        if (file.type.startsWith("image/")) {
          if (currentImageCount + imgCount >= MAX_IMAGES) {
            setErrors({ media: `Maximum ${MAX_IMAGES} images allowed` });
            continue;
          }

          const uniqueId = `img-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          newImages.push({
            file, // Keep file for upload
            id: uniqueId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: objectUrl, // This is critical for preview
            category: "other",
            order: currentImageCount + imgCount,
          });
          imgCount++;
        } else if (file.type.startsWith("video/")) {
          if (currentVideoCount + vidCount >= MAX_VIDEOS) {
            setErrors({ media: `Maximum ${MAX_VIDEOS} videos allowed` });
            continue;
          }

          const uniqueId = `vid-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          newVideos.push({
            file,
            id: uniqueId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: objectUrl,
            order: currentVideoCount + vidCount,
          });
          vidCount++;
        }
      }

      // Update state - this triggers the re-render with the new preview
      if (newImages.length > 0) {
        setLocalImages((prev) => {
          const updated = [...prev, ...newImages];
          // Update parent form data with only the new uploads (not combined existing + new)
          const newUploadsOnly = updated.filter(img => img.type !== 'existing');
          setTimeout(
            () => updateFormData({ images: newUploadsOnly }),
            0
          );
          return updated;
        });
      }
      if (newVideos.length > 0) {
        setLocalVideos((prev) => {
          const updated = [...prev, ...newVideos];
          // Update parent form data with only the new uploads (not combined existing + new)
          const newUploadsOnly = updated.filter(vid => vid.type !== 'existing');
          setTimeout(
            () => updateFormData({ videos: newUploadsOnly }),
            0
          );
          return updated;
        });
      }
    },
    [
      localImages.length,
      localVideos.length,
      errors,
      setErrors,
      validateFileLocally,
    ]
  );

  // Drag & Drop Handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = "";
  };

  const removeMedia = (type, index) => {
    const media = type === "image" ? localImages[index] : localVideos[index];

    if (media.type === "existing") {
      // For existing media, add to removed lists
      if (type === "image") {
        const currentRemoved = formData.removedImages || [];
        updateFormData({ removedImages: [...currentRemoved, media.url] });
      } else {
        const currentRemoved = formData.removedVideos || [];
        updateFormData({ removedVideos: [...currentRemoved, media.url] });
      }
      // The sync effect will remove it from localImages/localVideos
    } else {
      // For new media, remove from local state and update formData with only new uploads
      if (type === "image") {
        setLocalImages((prev) => {
          const images = [...prev];
          // Release memory if it's a blob
          if (images[index].url && images[index].url.startsWith("blob:")) {
            URL.revokeObjectURL(images[index].url);
          }
          images.splice(index, 1);
          const updated = images.map((img, i) => ({ ...img, order: i }));
          // Update parent form data with only the new uploads (not combined existing + new)
          const newUploadsOnly = updated.filter(img => img.type !== 'existing');
          setTimeout(
            () => updateFormData({ images: newUploadsOnly }),
            0
          );
          return updated;
        });
      } else {
        setLocalVideos((prev) => {
          const videos = [...prev];
          if (videos[index].url && videos[index].url.startsWith("blob:")) {
            URL.revokeObjectURL(videos[index].url);
          }
          videos.splice(index, 1);
          const updated = videos;
          // Update parent form data with only the new uploads (not combined existing + new)
          const newUploadsOnly = updated.filter(vid => vid.type !== 'existing');
          setTimeout(
            () => updateFormData({ videos: newUploadsOnly }),
            0
          );
          return updated;
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-heading mb-2">
          Photos & Videos
        </h1>
        <p className="text-muted text-lg">
          Update your property&apos;s media gallery
        </p>
        {hasChanges && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <div className="flex items-center gap-2 text-blue-800">
              <FiEdit3 size={16} />
              <span className="text-sm font-medium">Media updated</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-linear-to-r from-purple-500 to-purple-600 rounded-lg">
            <FiUpload className="text-white" size={18} />
          </div>
          <div>
            <label className="text-xl font-bold text-heading">
              Upload Media
            </label>
            <p className="text-sm text-muted">
              Add up to {MAX_IMAGES} images and {MAX_VIDEOS} videos
            </p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 md:p-8 text-center transition-all duration-300 ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-gray-300 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="space-y-4 pointer-events-none">
            <div className="text-6xl">{isDragOver ? "📂" : "📸"}</div>
            <div>
              <h3 className="text-lg font-semibold text-heading mb-2">
                {isDragOver ? "Drop files here" : "Drag & drop files here"}
              </h3>
              <p className="text-muted">
                or{" "}
                <span className="text-primary font-medium">browse files</span>
              </p>
              <p className="text-xs text-muted mt-2">
                JPG, PNG, WebP (Max 10MB) & MP4, AVI, MOV (Max 100MB)
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.media && (
          <div className="p-4 md:p-4 bg-red-50 border border-red-200 rounded-lg animate-in fade-in zoom-in duration-300">
            <div className="flex items-start space-x-3">
              <FiAlertCircle
                className="text-red-500 mt-0.5 shrink-0"
                size={18}
              />
              <p className="text-red-700 text-sm md:text-sm font-medium leading-relaxed">
                {errors.media}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Images Section */}
      {localImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-linear-to-r from-green-500 to-green-600 rounded-lg">
              <FiImage className="text-white" size={18} />
            </div>
            <div>
              <label className="text-xl font-bold text-heading">
                Images ({localImages.length}/{MAX_IMAGES})
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {localImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden min-h-[120px] md:min-h-20">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">📷</div>
                  )}

                  {/* Delete Button Overlay */}
                  <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia("image", index);
                      }}
                      className="p-3 md:p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors backdrop-blur-sm shadow-sm"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {localVideos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-linear-to-r from-red-500 to-red-600 rounded-lg">
              <FiVideo className="text-white" size={18} />
            </div>
            <div>
              <label className="text-xl font-bold text-heading">
                Videos ({localVideos.length}/{MAX_VIDEOS})
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="aspect-video relative bg-black">
                  {playingVideo === index ? (
                    <video
                      src={video.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain [&::-webkit-media-controls-panel]:bg-black/80 [&::-webkit-media-controls-play-button]:w-12 [&::-webkit-media-controls-play-button]:h-12 md:[&::-webkit-media-controls-play-button]:w-8 md:[&::-webkit-media-controls-play-button]:h-8"
                      onEnded={() => setPlayingVideo(null)}
                    />
                  ) : (
                    <>
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <FiVideo className="text-white/20" size={48} />
                      </div>
                      {/* Play Button Overlay */}
                      <button
                        onClick={() => setPlayingVideo(index)}
                        className="absolute inset-0 w-full h-full flex items-center justify-center group z-10"
                      >
                        <div className="w-16 h-16 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all transform group-hover:scale-110">
                          <FiPlay className="text-white ml-1" size={28} />
                        </div>
                      </button>
                    </>
                  )}
                </div>

                <div className="p-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-heading truncate flex-1">
                    {video.name}
                  </p>
                  <button
                    onClick={() => removeMedia("video", index)}
                    className="p-3 md:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Media Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FiImage className="text-blue-600" size={16} />
          </div>
          <h3 className="text-lg font-bold text-blue-800">
            Media Requirements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Images</h4>
            <ul className="text-blue-600 space-y-1">
              <li>&quot; At least 1 photo required</li>
              <li>&quot; Maximum 5MB per image</li>
              <li>&quot; JPG, PNG, or WebP format</li>
              <li>&quot; High resolution recommended</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">
              Videos (Optional)
            </h4>
            <ul className="text-blue-600 space-y-1">
              <li>&quot; Maximum 50MB per video</li>
              <li>&quot; MP4 or WebM format</li>
              <li>&quot; Keep under 2 minutes</li>
              <li>&quot; Good lighting and audio</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {errors.images && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-sm font-medium">{errors.images}</p>
        </motion.div>
      )}
    </div>
  );
}