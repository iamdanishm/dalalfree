import Image from "next/image";
import { FiFile, FiVideo, FiCheck } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

export default function PropertyKYCTab({ property }) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <h3 className="font-semibold text-heading text-lg md:text-xl">
          KYC Documents
        </h3>
        <span className="text-sm text-muted">
          {property.kycSummary?.isComplete ? (
            <span className="text-green-600 flex items-center">
              <FiCheck className="w-4 h-4 mr-1" />
              Complete
            </span>
          ) : (
            <span className="text-yellow-600">Incomplete</span>
          )}
        </span>
      </div>

      {/* Aadhaar Documents */}
      <div className="bg-surface rounded-xl p-4 md:p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiFile className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <h4 className="text-base md:text-lg font-semibold text-heading">
            Aadhaar Documents
          </h4>
        </div>
        {property.kycFiles?.aadhaar?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {property.kycFiles.aadhaar.map((file, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => window.open(file.url, "_blank")}
              >
                {/* Preview */}
                <div className="aspect-4/3 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                  {file.url &&
                  (file.url.includes(".pdf") ||
                    file.name?.toLowerCase().includes(".pdf")) ? (
                    <div className="text-center">
                      <FiFile className="w-8 h-8 md:w-12 md:h-12 text-blue-500 mx-auto mb-2" />
                      <span className="text-xs text-blue-600 font-medium">
                        PDF
                      </span>
                    </div>
                  ) : file.url &&
                    (file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                      file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                    <Image
                      src={file.url}
                      alt={file.name || `Aadhaar ${index + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `
                          <div class="flex items-center justify-center h-full">
                            <svg class="w-8 h-8 md:w-12 md:h-12 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <FiFile className="w-8 h-8 md:w-12 md:h-12 text-blue-500 cursor-pointer" />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm font-medium">
                        Click to View
                      </div>
                    </div>
                  </div>
                </div>
                {/* File Info */}
                <div className="p-3 md:p-4">
                  <p className="text-sm font-medium text-heading truncate mb-1">
                    {file.name || `Aadhaar ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted">
                    {(file.size / 1024).toFixed(1)} KB {file.type || "Document"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-muted">
            <FiFile className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No Aadhaar documents uploaded</p>
          </div>
        )}
      </div>

      {/* PAN Card Documents */}
      <div className="bg-surface rounded-xl p-4 md:p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <FiFile className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          </div>
          <h4 className="text-base md:text-lg font-semibold text-heading">
            PAN Card Documents
          </h4>
        </div>
        {property.kycFiles?.pan ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div
              className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => window.open(property.kycFiles.pan.url, "_blank")}
            >
              {/* Preview */}
              <div className="aspect-4/3 bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center relative">
                {property.kycFiles.pan.url &&
                (property.kycFiles.pan.url.includes(".pdf") ||
                  property.kycFiles.pan.name
                    ?.toLowerCase()
                    .includes(".pdf")) ? (
                  <div className="text-center">
                    <FiFile className="w-8 h-8 md:w-12 md:h-12 text-orange-500 mx-auto mb-2" />
                    <span className="text-xs text-orange-600 font-medium">
                      PDF
                    </span>
                  </div>
                ) : property.kycFiles.pan.url &&
                  (property.kycFiles.pan.url.match(
                    /\.(jpg|jpeg|png|gif|webp)$/i
                  ) ||
                    property.kycFiles.pan.name?.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i
                    )) ? (
                  <Image
                    src={property.kycFiles.pan.url}
                    alt={property.kycFiles.pan.name || "PAN Card"}
                    fill
                    className="object-cover cursor-pointer"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="flex items-center justify-center h-full">
                          <svg class="w-8 h-8 md:w-12 md:h-12 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <FiFile className="w-8 h-8 md:w-12 md:h-12 text-orange-500 cursor-pointer" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm font-medium">
                      Click to View
                    </div>
                  </div>
                </div>
              </div>
              {/* File Info */}
              <div className="p-3 md:p-4">
                <p className="text-sm font-medium text-heading truncate mb-1">
                  {property.kycFiles.pan.name || "PAN Card"}
                </p>
                <p className="text-xs text-muted">
                  {(property.kycFiles.pan.size / 1024).toFixed(1)} KB{" "}
                  {property.kycFiles.pan.type || "Document"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-muted">
            <FiFile className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No PAN card uploaded</p>
          </div>
        )}
      </div>

      {/* Video KYC */}
      <div className="bg-surface rounded-xl p-4 md:p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <FiVideo className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          </div>
          <h4 className="text-base md:text-lg font-semibold text-heading">
            Video KYC
          </h4>
        </div>
        {property.kycFiles?.video ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div
              className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => window.open(property.kycFiles.video.url, "_blank")}
            >
              {/* Video Preview */}
              <div className="aspect-4/3 bg-linear-to-br from-red-50 to-red-100 flex items-center justify-center relative">
                <div className="text-center">
                  <FiVideo className="w-8 h-8 md:w-12 md:h-12 text-red-500 mx-auto mb-2" />
                  <span className="text-xs text-red-600 font-medium">
                    Video
                  </span>
                </div>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <FiVideo className="w-4 h-4" />
                      Click to Play
                    </div>
                  </div>
                </div>
              </div>
              {/* File Info */}
              <div className="p-3 md:p-4">
                <p className="text-sm font-medium text-heading truncate mb-1">
                  {property.kycFiles.video.name || "Video KYC"}
                </p>
                <p className="text-xs text-muted">
                  {property.kycFiles.video.duration
                    ? `${Math.floor(
                        property.kycFiles.video.duration / 60
                      )}:${String(
                        property.kycFiles.video.duration % 60
                      ).padStart(2, "0")}`
                    : `${(property.kycFiles.video.size / 1024 / 1024).toFixed(
                        1
                      )} MB`}{" "}
                  Video
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-muted">
            <FiVideo className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No video KYC uploaded</p>
          </div>
        )}
      </div>

      {/* Agreement PDF */}
      <div className="bg-surface rounded-xl p-4 md:p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiFile className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
          <h4 className="text-base md:text-lg font-semibold text-heading">
            Agreement Documents
          </h4>
        </div>
        {property.kycFiles?.agreement ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Preview */}
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center relative">
                <div className="text-center">
                  <FiFile className="w-8 h-8 md:w-12 md:h-12 text-purple-500 mx-auto mb-2" />
                  <span className="text-xs text-purple-600 font-medium">
                    PDF
                  </span>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() =>
                      window.open(property.kycFiles.agreement.url, "_blank")
                    }
                    className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                  >
                    View Full
                  </button>
                </div>
              </div>
              {/* File Info */}
              <div className="p-3 md:p-4">
                <p className="text-sm font-medium text-heading truncate mb-1">
                  {property.kycFiles.agreement.name || "Agreement"}
                </p>
                <p className="text-xs text-muted">
                  {(property.kycFiles.agreement.size / 1024).toFixed(1)} KB{" "}
                  {property.kycFiles.agreement.type || "Document"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-muted">
            <FiFile className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No agreement uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
