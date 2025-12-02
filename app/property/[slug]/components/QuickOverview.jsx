import { FiHome, FiCheckCircle } from "react-icons/fi";
import { FaBath, FaChair } from "react-icons/fa";

export default function QuickOverview({ specs }) {
  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-center gap-6">
        {/* BHK */}
        <div className="flex items-center gap-2">
          <FiHome className="text-blue-600" size={18} />
          <span className="font-medium text-gray-900 text-sm">{specs.bhk}</span>
        </div>

        {/* Bathrooms */}
        <div className="flex items-center gap-2">
          <FaBath className="text-blue-600" size={18} />
          <span className="font-medium text-gray-900 text-sm">
            {specs.bathrooms} Baths
          </span>
        </div>

        {/* Furnishing */}
        <div className="flex items-center gap-2">
          <FaChair className="text-blue-600" size={18} />
          <span className="font-medium text-gray-900 text-sm">
            {specs.furnishing}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <FiCheckCircle className="text-green-600" size={18} />
          <span className="font-medium text-gray-900 text-sm">
            Ready to Move
          </span>
        </div>
      </div>
    </div>
  );
}
