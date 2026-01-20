import Amenity from "@/app/lib/models/Amenity";

/**
 * Helper function to get icon for nearby place types
 * @param {string} type - Place type
 * @returns {string} Icon name
 */
export function getNearbyPlaceIcon(type) {
  const iconMap = {
    school: "FaGraduationCap",
    hospital: "FaHospital",
    mall: "FaShoppingBag",
    metro: "FaSubway",
    "bus-stop": "FaBus",
    restaurant: "FaUtensils",
    park: "FaTree",
    bank: "FaUniversity",
    supermarket: "FaShoppingCart",
  };
  return iconMap[type] || "FiMapPin";
}

/**
 * Transform society amenities IDs to full objects
 * @param {Array<string>} amenityIds - Array of amenity ObjectIds
 * @returns {Promise<Array<Object>>} Transformed amenities
 */
export async function transformSocietyAmenities(amenityIds) {
  if (!Array.isArray(amenityIds) || amenityIds.length === 0) {
    return [];
  }

  try {
    // Fetch amenities from database
    const amenities = await Amenity.find({ _id: { $in: amenityIds } });

    return amenities.map((amenity) => ({
      name: amenity.name,
      title: amenity.title,
      available: true,
      icon: amenity.icon,
      image: amenity.image,
      _id: amenity._id, // Include the ID for reference
    }));
  } catch (error) {
    console.error("Error fetching society amenities:", error);
    return [];
  }
}

/**
 * Transform nearby places to amenities format
 * @param {Array<Object>} nearbyPlaces - Array of nearby places
 * @returns {Array<Object>} Transformed amenities
 */
export function transformNearbyPlacesToAmenities(nearbyPlaces) {
  if (!Array.isArray(nearbyPlaces)) return [];

  return nearbyPlaces.map((place) => ({
    name: place.name,
    distance: place.distance,
    rating: place.rating || 0,
    icon: getNearbyPlaceIcon(place.type),
    category: place.type,
  }));
}