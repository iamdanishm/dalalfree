"use client";
import { useEffect } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdClose } from "react-icons/md";

export default function AdminGalleryModal({
  processedMedia,
  galleryIndex,
  setGalleryIndex,
  showAllGallery,
  setShowAllGallery,
  property,
}) {
  // Handle keyboard events
  useEffect(() => {
    if (!showAllGallery) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setGalleryIndex((prev) =>
          prev > 0 ? prev - 1 : processedMedia.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setGalleryIndex((prev) =>
          prev < processedMedia.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "Escape") {
        setShowAllGallery(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [
    showAllGallery,
    setShowAllGallery,
    processedMedia.length,
    setGalleryIndex,
  ]);

  if (!showAllGallery) return null;

  const currentMedia = processedMedia[galleryIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex-none bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between text-white max-w-7xl mx-auto">
          <div className="text-lg font-semibold truncate">
            {property?.title || "Property"}
          </div>
          <button
            onClick={() => setShowAllGallery(false)}
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors flex-none"
            aria-label="Close gallery"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content - Image/Video */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          {/* Navigation Arrows */}
          {processedMedia.length > 1 && (
            <>
              {galleryIndex > 0 && (
                <button
                  onClick={() =>
                    setGalleryIndex((prev) =>
                      prev > 0 ? prev - 1 : processedMedia.length - 1
                    )
                  }
                  className="absolute left-0 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group ml-2 md:ml-4"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="text-white w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                </button>
              )}

              {galleryIndex < processedMedia.length - 1 && (
                <button
                  onClick={() =>
                    setGalleryIndex((prev) =>
                      prev < processedMedia.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-0 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group mr-2 md:mr-4"
                  aria-label="Next image"
                >
                  <FiChevronRight className="text-white w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </>
          )}

          {/* Media Container */}
          <div className="w-full max-h-full flex items-center justify-center">
            {currentMedia?.type === "video" ? (
              <video
                src={currentMedia.src}
                controls
                controlsList="nofullscreen nodownload noremoteplayback"
                className="max-w-full max-h-[50vh] md:max-h-[55vh] object-contain rounded-lg shadow-2xl"
                preload="metadata"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <Image
                src={currentMedia?.src || ""}
                alt={`${property?.title || "Property"} - Photo ${
                  galleryIndex + 1
                }`}
                width={1200}
                height={800}
                className="max-w-full max-h-[50vh] md:max-h-[55vh] object-contain rounded-lg shadow-2xl"
                priority
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer - Thumbnails & Counter */}
      <div className="flex-none bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Image Counter */}
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-base">
              <span className="font-semibold">{galleryIndex + 1}</span>
              <span className="text-white/60 mx-2">/</span>
              <span className="text-white/60">{processedMedia.length}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto max-w-[95vw] p-2 rounded-lg bg-black/20 backdrop-blur-sm">
              {processedMedia.map((media, index) => {
                const thumbnailSrc =
                  media.type === "video" ? media.thumbnail : media.src;
                return (
                  <button
                    key={index}
                    onClick={() => setGalleryIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      index === galleryIndex
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
                          className="w-5 h-5 md:w-6 md:h-6 text-white"
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
          <div className="text-center mt-3 text-white/50 text-xs md:text-sm">
            Use ← → keys to navigate • ESC to close
          </div>
        </div>
      </div>
    </div>
  );
}
