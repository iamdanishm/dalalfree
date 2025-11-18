import React, { useEffect } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function GalleryModal({
  property,
  isOpen,
  currentIndex,
  onClose,
  onNavigate,
  onKeyDown,
}) {
  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => onKeyDown(e);

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, currentIndex, onKeyDown]);

  if (!isOpen) return null;

  // Handle both legacy string format and new object format
  const currentMedia =
    typeof property.images[currentIndex] === "object"
      ? property.images[currentIndex]
      : { src: property.images[currentIndex], type: "image" };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="text-lg font-semibold">{property.title}</div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
            aria-label="Close gallery"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Navigation Arrows */}
        {property.images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={() => onNavigate("prev")}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
                aria-label="Previous image"
              >
                <FiChevronLeft className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {currentIndex < property.images.length - 1 && (
              <button
                onClick={() => onNavigate("next")}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
                aria-label="Next image"
              >
                <FiChevronRight className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </>
        )}

        {/* Main Media */}
        <div className="relative max-w-[90vw] max-h-[85vh]">
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.src}
              controls
              controlsList="nofullscreen nodownload noremoteplayback"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              preload="metadata"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <Image
              src={currentMedia.src}
              alt={`${property.title} - Photo ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full rounded-lg shadow-2xl"
              priority
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
        {/* Image Counter */}
        <div className="flex justify-center mb-4">
          <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-2 rounded-full">
            <span className="font-semibold">{currentIndex + 1}</span>
            <span className="text-white/60 mx-2">/</span>
            <span className="text-white/60">{property.images.length}</span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex justify-center">
          <div className="flex gap-2 overflow-x-auto max-w-[90vw] p-2 rounded-lg bg-black/20 backdrop-blur-sm">
            {property.images.map((image, index) => {
              const media =
                typeof image === "object"
                  ? image
                  : { src: image, type: "image" };
              const thumbnailSrc =
                media.type === "video" ? media.thumbnail : media.src;

              return (
                <button
                  key={index}
                  onClick={() => onNavigate("goto", index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    index === currentIndex
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-white/50"
                  } relative`}
                  aria-label={`View ${media.type} ${index + 1}`}
                >
                  <Image
                    src={thumbnailSrc}
                    alt={`${media.type} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                  {media.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="text-center mt-3 text-white/50 text-sm">
          Use ← → keys to navigate • ESC to close
        </div>
      </div>
    </div>
  );
}
