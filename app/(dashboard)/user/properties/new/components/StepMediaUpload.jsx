/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiImage,
  FiVideo,
  FiAlertCircle,
  FiTrash2,
  FiPlay,
} from "react-icons/fi";

const MAX_IMAGES = 20;
const MAX_VIDEOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/avi", "video/mov"];

export default function StepMediaUpload({
  formData,
  updateFormData,
  errors,
  setErrors,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [playingVideo, setPlayingVideo] = useState(null);

  // Initialize state once from props.
  const [localImages, setLocalImages] = useState([]);
  const [localVideos, setLocalVideos] = useState([]);

  const fileInputRef = useRef(null);

  // Sync local state with formData when navigating between steps (only when formData changes externally)
  useEffect(() => {
    const currentImages = formData.images || [];
    const currentVideos = formData.videos || [];

    // Only update if the formData has different items (by ID comparison)
    const localImageIds = localImages.map((i) => i.id).sort();
    const formImageIds = currentImages.map((i) => i.id).sort();
    const imagesDifferent =
      JSON.stringify(localImageIds) !== JSON.stringify(formImageIds);

    const localVideoIds = localVideos.map((v) => v.id).sort();
    const formVideoIds = currentVideos.map((v) => v.id).sort();
    const videosDifferent =
      JSON.stringify(localVideoIds) !== JSON.stringify(formVideoIds);

    if (imagesDifferent) {
      setLocalImages(currentImages);
    }
    if (videosDifferent) {
      setLocalVideos(currentVideos);
    }
  }, [formData.images, formData.videos]); // Removed localImages, localVideos to break circular dependency

  // Sync to parent ONLY when local state changes (use refs to avoid circular dependency)
  const prevImagesRef = useRef();
  const prevVideosRef = useRef();

  useEffect(() => {
    const prevImages = prevImagesRef.current || [];
    const prevVideos = prevVideosRef.current || [];

    const imagesChanged =
      JSON.stringify(localImages.map((i) => i.id)) !==
      JSON.stringify(prevImages.map((i) => i.id));
    const videosChanged =
      JSON.stringify(localVideos.map((v) => v.id)) !==
      JSON.stringify(prevVideos.map((v) => v.id));

    if (imagesChanged || videosChanged) {
      updateFormData({ images: localImages, videos: localVideos });
    }

    // Update refs for next comparison
    prevImagesRef.current = localImages;
    prevVideosRef.current = localVideos;
  }, [localImages, localVideos, updateFormData]); // Removed formData dependencies to break circular dependency

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

  // Validation
  const validateFile = useCallback(
    (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrors({ media: `File ${file.name} is too large. Max size: 10MB` });
        return false;
      }
      if (
        file.type.startsWith("image/") &&
        !ALLOWED_IMAGE_TYPES.includes(file.type)
      ) {
        setErrors({
          media: `File ${file.name} is not a supported image format`,
        });
        return false;
      }
      if (
        file.type.startsWith("video/") &&
        !ALLOWED_VIDEO_TYPES.includes(file.type)
      ) {
        setErrors({
          media: `File ${file.name} is not a supported video format`,
        });
        return false;
      }
      return true;
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
        if (!validateFile(file)) continue;

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
        setLocalImages((prev) => [...prev, ...newImages]);
      }
      if (newVideos.length > 0) {
        setLocalVideos((prev) => [...prev, ...newVideos]);
      }
    },
    [localImages.length, localVideos.length, errors, setErrors, validateFile]
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
    if (type === "image") {
      setLocalImages((prev) => {
        const images = [...prev];
        // Release memory if it's a blob
        if (images[index].url && images[index].url.startsWith("blob:")) {
          URL.revokeObjectURL(images[index].url);
        }
        images.splice(index, 1);
        return images.map((img, i) => ({ ...img, order: i }));
      });
    } else {
      setLocalVideos((prev) => {
        const videos = [...prev];
        if (videos[index].url && videos[index].url.startsWith("blob:")) {
          URL.revokeObjectURL(videos[index].url);
        }
        videos.splice(index, 1);
        return videos;
      });
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
          Showcase your property with high-quality images and videos
        </p>
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
                JPG, PNG, WebP & MP4, AVI, MOV (Max 10MB)
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
              /* FIX: Removed complex Framer Motion variants here to prevent "stuck" hidden state */
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
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
    </div>
  );
}
