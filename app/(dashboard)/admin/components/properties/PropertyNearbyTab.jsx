import { FiMapPin, FiStar } from "react-icons/fi";
import {
  FaGraduationCap,
  FaHospital,
  FaShoppingBag,
  FaSubway,
  FaUtensils,
  FaUniversity,
  FaLeaf,
  FaDumbbell,
  FaPlane,
  FaTrain,
  FaMedkit,
} from "react-icons/fa";

export default function PropertyNearbyTab({ property }) {
  // Icon map for nearby places
  const nearbyIconMap = {
    school: FaGraduationCap,
    hospital: FaHospital,
    mall: FaShoppingBag,
    metro: FaSubway,
    restaurant: FaUtensils,
    bank: FaUniversity,
    park: FaLeaf,
    gym: FaDumbbell,
    pharmacy: FaMedkit,
    airport: FaPlane,
    railway: FaTrain,
  };

  // Get icon component from icon name
  const getNearbyIcon = (iconName) => {
    if (!iconName) return FiMapPin;
    const IconComponent =
      nearbyIconMap[iconName.replace("Fa", "").toLowerCase()];
    return IconComponent || FiMapPin;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Google Maps Iframe */}
      {property.coordinates && (
        <div className="mb-6">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <iframe
              src={`https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="250"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${property.location} location map`}
              className="border-0"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2 text-center">
            {property.address || property.location}
          </p>
        </div>
      )}

      {/* Nearby Places Section */}
      <div>
        <h3 className="font-semibold text-heading mb-4 text-lg md:text-xl">
          Nearby Places
        </h3>
        {((Array.isArray(property.nearbyPlaces) && property.nearbyPlaces.length > 0)
          ? property.nearbyPlaces
          : (property.amenities?.nearby || [])).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {((Array.isArray(property.nearbyPlaces) && property.nearbyPlaces.length > 0)
              ? property.nearbyPlaces
              : (property.amenities?.nearby || [])).map((place, index) => (
              <div
                key={index}
                className="flex items-center p-3 md:p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  {(() => {
                    const IconComponent = getNearbyIcon(place.icon || place.type);
                    return (
                      <IconComponent
                        className="text-blue-600"
                        size={20}
                      />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {place.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <span>{place.distance} away</span>
                    {place.rating && (
                      <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                        <FiStar
                          className="text-yellow-500"
                          size={12}
                        />
                        <span className="text-xs font-medium text-yellow-700">
                          {place.rating}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted capitalize px-2 py-1 bg-gray-100 rounded-full flex-shrink-0">
                  {place.type || place.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 text-muted bg-surface rounded-lg">
            <FiMapPin className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4" />
            <p className="text-sm md:text-base">
              No nearby places information available
            </p>
          </div>
        )}
      </div>

      {/* Neighborhood Info */}
      {property.city && property.state && (
        <div className="p-4 bg-surface rounded-lg">
          <h4 className="font-semibold text-heading mb-3 text-base md:text-lg">
            Location Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <p className="text-xs text-muted">City</p>
              <p className="font-medium text-sm md:text-base">{property.city}</p>
            </div>
            <div>
              <p className="text-xs text-muted">State</p>
              <p className="font-medium text-sm md:text-base">{property.state}</p>
            </div>
            {property.pincode && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted">Pincode</p>
                <p className="font-medium text-sm md:text-base">{property.pincode}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}