import { FiCheck } from "react-icons/fi";

export default function PropertyAmenitiesTab({ property }) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Society Amenities */}
      <div>
        <h3 className="font-semibold text-heading mb-4 text-lg md:text-xl">
          Society Amenities
        </h3>
        {property.amenities?.society?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {property.amenities.society.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center p-3 md:p-4 bg-surface rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  {amenity.image ? (
                    <img
                      src={amenity.image}
                      alt={amenity.title || amenity.name}
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                  ) : (
                    <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">
                    {amenity.title || amenity.name}
                  </p>
                  <p
                    className={`text-xs md:text-sm ${
                      amenity.available !== false
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {amenity.available !== false
                      ? "Available"
                      : "Not Available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 text-muted bg-surface rounded-lg">
            <p className="text-sm md:text-base">
              No society amenities listed
            </p>
          </div>
        )}
      </div>

      {/* Highlights */}
      {property.highlights?.length > 0 && (
        <div>
          <h3 className="font-semibold text-heading mb-4 text-base md:text-lg">
            Highlights
          </h3>
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
    </div>
  );
}