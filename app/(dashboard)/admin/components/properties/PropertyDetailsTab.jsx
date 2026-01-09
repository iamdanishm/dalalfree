import {
  FiMapPin,
  FiCheck,
  FiDollarSign,
  FiSquare,
  FiLayers,
  FiHome,
  FiCalendar,
  FiUser,
  FiMaximize,
  FiMinimize,
  FiSun,
  FiCompass,
} from "react-icons/fi";
import { MdVerified, MdStars, MdRocket } from "react-icons/md";
import { FaBath } from "react-icons/fa";

export default function PropertyDetailsTab({ property }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "sold":
        return "bg-purple-100 text-purple-800";
      case "rented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    if (price < 100000) {
      // Less than 1 lakh - show as-is with commas
      return `₹${price.toLocaleString("en-IN")}`;
    }
    // 1 lakh or more - show in lakhs
    const lakhs = price / 100000;
    return `₹${lakhs.toLocaleString("en-IN", {
      minimumFractionDigits: lakhs < 10 ? 1 : 0,
      maximumFractionDigits: 2,
    })} Lakh`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Property Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                property.propertyType === "rent"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {property.propertyType === "rent" ? "For Rent" : "For Sale"}
            </span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                property.status
              )}`}
            >
              {property.status}
            </span>
            {property.verified && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                <MdVerified className="w-4 h-4" />
                Verified
              </span>
            )}
            {property.featured && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                <MdStars className="w-4 h-4" />
                Featured
              </span>
            )}
            {property.boosted && (
              <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                <MdRocket className="w-4 h-4" />
                Boosted
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-heading">
            {property.title || "Untitled Property"}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-muted">
            <FiMapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {[property.location, property.city, property.state]
                .filter(Boolean)
                .join(", ") || "Location not specified"}
            </span>
          </div>
        </div>
        <div className="text-left lg:text-right min-w-0">
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {formatPrice(property.price)}
          </div>
          {property.negotiable === "Yes" && (
            <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Negotiable
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div>
          <h4 className="font-semibold text-heading mb-2">Description</h4>
          <p className="text-body text-sm md:text-base">
            {property.description}
          </p>
        </div>
      )}

      {/* Property Specifications Grid */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-100/50 shadow-lg">
        <h4 className="font-semibold text-heading mb-4">Property Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Built-up Area */}
          {property.builtUpArea && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-blue-100 flex-shrink-0">
                <FiMaximize className="text-blue-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Built-up Area</p>
                <p className="font-semibold text-sm md:text-base truncate">
                  {property.builtUpArea.toLocaleString()} sq ft
                </p>
              </div>
            </div>
          )}
          {/* Carpet Area */}
          {property.carpetArea && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-purple-100 flex-shrink-0">
                <FiMinimize className="text-purple-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Carpet Area</p>
                <p className="font-semibold text-sm md:text-base truncate">
                  {property.carpetArea.toLocaleString()} sq ft
                </p>
              </div>
            </div>
          )}
          {/* BHK */}
          {property.bhk && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-blue-100 flex-shrink-0">
                <FiHome className="text-blue-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">BHK</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.bhk}
                </p>
              </div>
            </div>
          )}
          {/* Bathrooms */}
          {property.bathrooms !== undefined && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-cyan-100 flex-shrink-0">
                <FaBath className="text-cyan-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Bathrooms</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.bathrooms}
                </p>
              </div>
            </div>
          )}
          {/* Balcony */}
          {property.balcony !== undefined && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-orange-100 flex-shrink-0">
                <FiSun className="text-orange-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Balcony</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.balcony}
                </p>
              </div>
            </div>
          )}
          {/* Floor */}
          {property.floor && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-indigo-100 flex-shrink-0">
                <FiLayers className="text-indigo-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Floor</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.floor}
                </p>
              </div>
            </div>
          )}
          {/* Total Floors */}
          {property.totalFloors && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-indigo-100 flex-shrink-0">
                <FiLayers className="text-indigo-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Total Floors</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.totalFloors}
                </p>
              </div>
            </div>
          )}
          {/* Category */}
          {property.category && (
            <div className="flex items-center space-x-3 p-3 md:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 rounded-xl">
              <div className="p-2 md:p-2.5 rounded-lg bg-green-100 flex-shrink-0">
                <FiLayers className="text-green-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Category</p>
                <p className="font-semibold text-sm md:text-base">
                  {property.category}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {property.furnishing && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Furnishing</p>
            <p className="font-medium capitalize text-sm md:text-base">
              {property.furnishing}
            </p>
          </div>
        )}
        {property.facing && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Facing</p>
            <p className="font-medium capitalize text-sm md:text-base">
              {property.facing}
            </p>
          </div>
        )}
        {property.age !== undefined && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Age</p>
            <p className="font-medium text-sm md:text-base">
              {property.age} {property.ageUnit || "years"}
            </p>
          </div>
        )}
        {property.parking && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Parking</p>
            <p className="font-medium text-sm md:text-base">
              {property.parking}
            </p>
          </div>
        )}
        {property.possessionStatus && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Possession Status</p>
            <p className="font-medium capitalize text-sm md:text-base">
              {property.possessionStatus.replace(/-/g, " ")}
            </p>
          </div>
        )}
        {property.maintenance && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Maintenance</p>
            <p className="font-medium text-sm md:text-base">
              {property.maintenance}
            </p>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="bg-surface rounded-lg p-4">
        <h4 className="font-semibold text-heading mb-3 flex items-center gap-2">
          <FiMapPin className="w-4 h-4" />
          Location Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {property.address && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-muted">Full Address</p>
              <p className="font-medium text-sm md:text-base">
                {property.address}
              </p>
            </div>
          )}
          {property.pincode && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-muted">Pincode</p>
              <p className="font-medium text-sm md:text-base">
                {property.pincode}
              </p>
            </div>
          )}
          {property.coordinates && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-muted">Coordinates</p>
              <p className="font-medium text-sm md:text-base">
                {property.coordinates.lat}, {property.coordinates.lng}
              </p>
            </div>
          )}
          {property.location && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-muted">Location</p>
              <p className="font-medium text-sm md:text-base">
                {property.location}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {property.createdAt && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Posted On</p>
            <p className="font-medium text-sm md:text-base">
              {formatDate(property.createdAt)}
            </p>
          </div>
        )}
        {property.updatedAt && (
          <div className="p-3 bg-surface rounded-lg">
            <p className="text-xs text-muted">Last Updated</p>
            <p className="font-medium text-sm md:text-base">
              {formatDate(property.updatedAt)}
            </p>
          </div>
        )}
      </div>

      {/* Highlights */}
      {property.highlights?.length > 0 && (
        <div>
          <h4 className="font-semibold text-heading mb-3">Highlights</h4>
          <div className="flex flex-wrap gap-2">
            {property.highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Owner Info */}
      <div className="p-4 bg-surface rounded-lg">
        <h4 className="font-semibold text-heading mb-3">Posted By</h4>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <FiUser className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm md:text-base truncate">
              {property.ownerId?.name || "Unknown"}
            </p>
            <p className="text-xs md:text-sm text-muted capitalize">
              {property.ownerId?.role || "user"}
            </p>
          </div>
          {property.ownerId?.isVerified && (
            <span className="flex items-center text-green-600 text-xs md:text-sm flex-shrink-0">
              <MdVerified className="w-4 h-4 md:w-5 md:h-5 mr-1" />
              Verified
            </span>
          )}
        </div>
        {property.ownerId?.email && (
          <p className="text-xs md:text-sm text-muted mt-2 truncate">
            {property.ownerId.email}
          </p>
        )}
      </div>
    </div>
  );
}
