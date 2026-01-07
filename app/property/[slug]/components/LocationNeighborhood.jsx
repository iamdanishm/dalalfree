import { FiMap, FiMapPin, FiStar, FiCompass } from "react-icons/fi";

export default function LocationNeighborhood({
  location,
  coordinates,
  neighborhood,
  amenities,
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-r from-blue-100 to-purple-100 rounded-lg">
            <FiMap className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Location & Neighborhood
          </h2>
        </div>
      </div>

      {/* Google Maps Iframe */}
      <div className="mb-6">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <iframe
            src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="300"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${location} location map`}
            className="border-0"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">{location}</p>
      </div>

      <div className="flex items-start mb-4">
        <FiMapPin className="mr-3 mt-1 text-gray-400 shrink-0" size={20} />
        <div>
          <div className="font-medium text-gray-900">{location}</div>
          <div className="text-sm text-gray-600">
            {neighborhood.demographics}
          </div>
        </div>
      </div>

      {/* Nearby Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {amenities.slice(0, 3).map((amenity, index) => (
          <div
            key={index}
            className="flex items-center p-4 bg-linear-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="p-2.5 bg-blue-100 rounded-lg mr-4">
              <amenity.icon className="text-blue-600" size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {amenity.name}
              </div>
              <div className="text-xs text-blue-600 font-medium">
                {amenity.distance} away
              </div>
            </div>
            {amenity.rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                <FiStar className="text-yellow-500" size={12} />
                <span className="text-xs font-medium text-yellow-700">
                  {amenity.rating}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
