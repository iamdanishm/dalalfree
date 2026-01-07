import { FiMapPin, FiShield, FiCheckCircle } from "react-icons/fi";

export default function PropertyHeader({ property, id }) {
  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-lg border border-blue-100 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center gap-3 mb-2">
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
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-1" size={16} />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl lg:text-3xl font-bold text-green-600">
              {property.price}
            </div>
            <div className="text-sm text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full mt-1">
              Negotiable Price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
