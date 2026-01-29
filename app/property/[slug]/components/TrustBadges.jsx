import { FiCheck, FiHeart, FiHome, FiShield, FiAward } from "react-icons/fi";

export default function TrustBadges({ property }) {
  // Dynamic trust badges based on property data
  const trustBadges = [];

  // Verified badge
  if (property?.verified) {
    trustBadges.push({
      label: "Verified Listing",
      icon: FiCheck,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      description: "100% Verified Property",
    });
  }
  // Owner/Partner badge based on who listed the property
  if (property?.ownerRole === "partner") {
    trustBadges.push({
      label: "Partner Listing",
      icon: FiAward,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      description: "Official DalalFree Partner",
    });
  } else {
    trustBadges.push({
      label: "Direct Owner",
      icon: FiHeart,
      color: "text-rose-600",
      bg: "bg-gradient-to-br from-rose-50 to-rose-100",
      border: "border-rose-200",
      description: "No Brokerage Involved",
    });
  }

  // Property type specific badges
  if (property?.propertyType === "sell") {
    trustBadges.push({
      label: "For Sale",
      icon: FiHome,
      color: "text-indigo-600",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      description: property?.possessionStatus === "ready-to-move"
        ? "Ready to Move"
        : "Under Construction",
    });
  } else if (property?.propertyType === "rent") {
    trustBadges.push({
      label: "For Rent",
      icon: FiHome,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      description: "Available for Rent",
    });
  }

  // Featured property badge
  if (property?.featured) {
    trustBadges.push({
      label: "Featured Property",
      icon: FiAward,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      description: "Premium Listing",
    });
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-xl relative overflow-hidden">
      {/* Premium background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>

      {/* Header with trust shield */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-sm">
            <FiShield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Trust & Safety</h3>
            <p className="text-sm text-gray-600">
              Guaranteed quality & reliability
            </p>
          </div>
        </div>
        <FiAward className="w-8 h-8 text-amber-500 opacity-80" />
      </div>

      <div className="relative grid grid-cols-1 gap-4">
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className={`group relative flex items-center gap-4 p-5 rounded-2xl ${badge.bg} border ${badge.border} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.8),transparent_50%)]"></div>

            {/* Premium icon container */}
            <div className="relative z-10 p-4 rounded-2xl bg-white shadow-lg border border-white/50 group-hover:shadow-xl transition-shadow duration-300">
              <badge.icon
                className={`${badge.color} drop-shadow-sm`}
                size={24}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1">
              <div className={`${badge.color} font-bold text-lg mb-1`}>
                {badge.label}
              </div>
              <div className="text-gray-600 font-medium text-sm">
                {badge.description}
              </div>
            </div>

            {/* Decorative accent */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ${badge.color.replace(
                  "text-",
                  "bg-"
                )} opacity-60`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}