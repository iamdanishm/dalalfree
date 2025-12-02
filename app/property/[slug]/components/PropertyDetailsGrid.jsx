import {
  FiCalendar,
  FiHome,
  FiMaximize,
  FiMinimize,
  FiCheckCircle,
  FiCompass,
  FiLayers,
  FiDollarSign,
  FiSun,
  FiTruck,
  FiHome as FiBuilding,
} from "react-icons/fi";
import { FaBath } from "react-icons/fa";

export default function PropertyDetailsGrid({ details }) {
  // Map of icon components for each detail type
  const iconMap = {
    "Built-up Area": FiMaximize,
    "Carpet Area": FiMinimize,
    "Possession Status": FiCheckCircle,
    Parking: FiTruck,
    Facing: FiCompass,
    Bathrooms: FaBath,
    Balcony: FiSun,
    Floor: FiLayers,
    Age: FiCalendar,
    Maintenance: FiDollarSign,
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Property Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => {
          const IconComponent = iconMap[detail.label];

          return (
            <div
              key={index}
              className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/30 hover:from-blue-50 hover:to-purple-50 hover:shadow-md transition-all duration-200"
            >
              <div className="p-2.5 rounded-lg bg-blue-100 mr-4 flex-shrink-0">
                {IconComponent && (
                  <IconComponent className="text-blue-600" size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {detail.label}
                </div>
                <div className="text-base font-semibold text-gray-900 truncate">
                  {detail.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
