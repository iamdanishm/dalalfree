import {
  FiMapPin,
  FiShield,
  FiCheckCircle,
  FiHome,
  FiTag,
  FiAlertTriangle,
} from "react-icons/fi";
import { useSession } from "next-auth/react";

export default function PropertyHeader({ property, id }) {
  const { data: session } = useSession();
  const isRent = property.propertyType?.toLowerCase() === "rent";
  const isNegotiable = property.negotiable === "Yes";

  // Check if current user is the property owner
  const isOwner = session?.user?.id && property?.ownerId &&
    (String(session.user.id) === String(property.ownerId._id || property.ownerId) ||
     String(session.user._id) === String(property.ownerId._id || property.ownerId));

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-lg border border-blue-100 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Property Type Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border ${
                isRent
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : "bg-amber-500 text-white border-amber-400"
              }`}
            >
              {isRent ? (
                <FiHome className="w-3.5 h-3.5" />
              ) : (
                <FiTag className="w-3.5 h-3.5" />
              )}
              <span>{isRent ? "For Rent" : "For Sale"}</span>
            </div>

            {/* Property Status Badge - Only show to property owner and only for non-approved status */}
            {isOwner && property.status && property.status !== "approved" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border ${getStatusColor(property.status)}`}>
                {property.status === "rejected" && <FiAlertTriangle className="w-3.5 h-3.5" />}
                <span>{property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}</span>
              </div>
            )}

            {/* Premium KYC Badge - Only show if verified */}
            {property.verified && (
              <div className="flex items-center gap-2 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/20">
                <FiShield className="w-3.5 h-3.5" />
                <span>KYC Verified</span>
                <FiCheckCircle className="w-3 h-3" />
              </div>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            {property.title}
          </h1>
          <div className="flex items-center text-gray-600 mb-2">
            <FiMapPin className="mr-1" size={16} />
            <span>{property.location}</span>
          </div>

          {/* Show rejection reason if property is rejected - Only to property owner */}
          {isOwner && property.status === "rejected" && property.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <FiAlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Property Rejected
                  </h4>
                  <p className="text-sm text-red-700">
                    Reason: {property.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl lg:text-3xl font-bold text-green-600">
              {property.price}
            </div>
            {isNegotiable && (
              <div className="text-sm text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full mt-1">
                Negotiable Price
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}