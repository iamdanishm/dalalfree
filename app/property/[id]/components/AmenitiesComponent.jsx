import { useState } from "react";

export default function AmenitiesComponent({ amenities }) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Filter only available amenities
  const availableAmenities = amenities.filter((amenity) => amenity.available);
  const displayItems = 5; // Show 5 items + 1 more button = 2 rows of 3 in desktop
  const hasMoreItems = availableAmenities.length > displayItems;
  const itemsToShow = showAllAmenities
    ? availableAmenities.length
    : displayItems;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Amenities</h3>
        {showAllAmenities && (
          <button
            onClick={() => setShowAllAmenities(false)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm transition-colors duration-200"
          >
            Show Less
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableAmenities.slice(0, itemsToShow).map((amenity, index) => (
          <div
            key={index}
            className="flex items-center p-4 rounded-lg border-2 bg-green-50 border-green-200 hover:bg-green-100 hover:shadow-md"
          >
            <div className="p-3 rounded-lg mr-4 bg-blue-100 text-blue-600">
              <amenity.icon size={20} />
            </div>
            <div>
              <span className="font-medium text-sm text-gray-900">
                {amenity.name}
              </span>
            </div>
          </div>
        ))}

        {/* Show More button at end of 2nd row */}
        {hasMoreItems && !showAllAmenities && (
          <button
            onClick={() => setShowAllAmenities(true)}
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
          >
            <div className="text-center">
              <div className="text-blue-600 font-bold text-lg">
                +{availableAmenities.length - displayItems}
              </div>
              <div className="text-blue-600 font-medium text-sm">more</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
