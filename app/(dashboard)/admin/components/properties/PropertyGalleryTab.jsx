import { useState } from "react";
import Image from "next/image";
import { FiHome, FiVideo } from "react-icons/fi";
import { MdPlayCircle } from "react-icons/md";
import Masonry from "react-masonry-css";
import AdminGalleryModal from "@/app/components/AdminGalleryModal";

export default function PropertyGalleryTab({ property }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showAllGallery, setShowAllGallery] = useState(false);

  // Process images and videos for gallery
  const processedMedia = property
    ? [
        ...(property.images || [])
          .filter((img) => img && img.url)
          .map((img) => ({
            src: img.url,
            type: "image",
            category: img.category || "other",
            order: img.order || 0,
            thumbnail: img.url,
          })),
        ...(property.videos || [])
          .filter((vid) => vid && vid.url)
          .map((vid) => ({
            src: vid.url,
            type: "video",
            thumbnail: property.images?.[0]?.url || null,
            order: vid.order || 0,
          })),
      ].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const imageCount = processedMedia.filter((m) => m.type === "image").length;
  const videoCount = processedMedia.filter((m) => m.type === "video").length;

  const getImageUrl = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    const firstImage = images[0];
    if (typeof firstImage === "string") {
      return firstImage;
    }
    return firstImage?.url || null;
  };

  // Masonry breakpoints for mobile responsiveness
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="p-4 md:p-6">
      {processedMedia.length > 0 ? (
        <div>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {processedMedia
              .slice(0, showAllGallery ? processedMedia.length : 6)
              .map((media, index) => (
                <div key={index} className="mb-4">
                  <div
                    className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-200"
                    style={{ aspectRatio: "3/2" }}
                    onClick={() => {
                      setGalleryIndex(index);
                      setShowAllGallery(true);
                    }}
                  >
                    {media.type === "video" ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={
                            media.thumbnail ||
                            getImageUrl(property.images)
                          }
                          alt={`Video ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <MdPlayCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-900" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={media.src}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, 33vw"
                      />
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 mx-auto">
                          {media.type === "video" ? (
                            <MdPlayCircle className="w-6 h-6 md:w-8 md:h-8" />
                          ) : (
                            <span className="text-xs md:text-sm font-medium">
                              View
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* More indicator */}
                    {index === 5 &&
                      !showAllGallery &&
                      processedMedia.length > 6 && (
                        <div
                          className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllGallery(true);
                          }}
                        >
                          <div className="text-center text-white">
                            <div className="text-xl md:text-2xl font-bold">
                              +{processedMedia.length - 6}
                            </div>
                            <div className="text-sm md:text-base">More</div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
          </Masonry>

          {/* Gallery Viewer */}
          {showAllGallery && (
            <AdminGalleryModal
              processedMedia={processedMedia}
              galleryIndex={galleryIndex}
              setGalleryIndex={setGalleryIndex}
              showAllGallery={showAllGallery}
              setShowAllGallery={setShowAllGallery}
              property={property}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12 text-muted bg-surface rounded-lg">
          <FiHome className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4" />
          <p className="text-sm md:text-base">No images or videos available</p>
        </div>
      )}
    </div>
  );
}