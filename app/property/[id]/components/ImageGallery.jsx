import React, { useMemo } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";

export default function ImageGallery({
  property,
  showAllImages,
  setShowAllImages,
  onOpenGalleryModal,
}) {
  // Process images - handle both legacy string format and new object format
  const processedImages = useMemo(() => {
    return property.images.map((item) => {
      if (typeof item === "string") {
        return { src: item, type: "image", thumbnail: item };
      }
      return item;
    });
  }, [property.images]);

  // Generate consistent, compact aspect ratios for uniform grid layout (avoiding staircase effect)
  const imageAspectRatios = useMemo(() => {
    // Use wide aspect ratio for all images to keep grid height compact
    const unifiedRatio = "3/2"; // 1.5:1 ratio - wider format for smaller height
    return processedImages.map(() => unifiedRatio); // Only regenerate when images change
  }, [processedImages]);

  // Breakpoint columns for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  // Count images and videos
  const imageCount = processedImages.filter(
    (item) => item.type === "image"
  ).length;
  const videoCount = processedImages.filter(
    (item) => item.type === "video"
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Property Gallery
        </h2>
        <p className="text-gray-600 text-sm">
          {imageCount} photos, {videoCount} videos
        </p>
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {processedImages
          .slice(0, showAllImages ? processedImages.length : 6)
          .map((media, index) => (
            <div key={index}>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-200 mb-4"
                style={{
                  aspectRatio: imageAspectRatios[index],
                }}
                onClick={() => onOpenGalleryModal(index)}
              >
                {media.type === "video" ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={media.thumbnail}
                      alt={`${property.title} - Video ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, 33vw"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm">
                        <svg
                          className="w-8 h-8 text-gray-900 ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={media.src}
                    alt={`${property.title} - ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, 33vw"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 mx-auto">
                      {media.type === "video" ? (
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
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z"
                          />
                        </svg>
                      ) : (
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {media.type === "video" ? "Play Video" : "View Image"}
                    </div>
                  </div>
                </div>

                {/* More items indicator */}
                {index === (showAllImages ? processedImages.length : 6) - 1 &&
                  !showAllImages &&
                  processedImages.length > 6 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenGalleryModal(
                          (showAllImages ? processedImages.length : 6) - 1
                        );
                      }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white cursor-pointer hover:bg-black/70 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          +{processedImages.length - 6}
                        </div>
                        <div className="text-sm">More media</div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
      </Masonry>
    </div>
  );
}
