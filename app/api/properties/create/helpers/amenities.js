/**
 * Amenity mapping for transforming IDs to full objects
 * This is kept as requested for temporary use
 */
export const amenityMap = {
  "24-7-security": {
    name: "24/7 Security",
    category: "safety",
    icon: "FiShield",
  },
  cctv: { name: "CCTV Surveillance", category: "safety", icon: "FiVideo" },
  intercom: { name: "Intercom", category: "safety", icon: "FiPhone" },
  "fire-safety": {
    name: "Fire Safety",
    category: "safety",
    icon: "FiAlertTriangle",
  },
  "gated-community": {
    name: "Gated Community",
    category: "safety",
    icon: "FiLock",
  },
  "power-backup": {
    name: "Power Backup",
    category: "utilities",
    icon: "FiZap",
  },
  "water-supply": {
    name: "24/7 Water Supply",
    category: "utilities",
    icon: "FiDroplets",
  },
  lift: { name: "Lift/Elevator", category: "convenience", icon: "FiArrowUp" },
  parking: { name: "Parking Space", category: "convenience", icon: "FiCar" },
  "waste-management": {
    name: "Waste Management",
    category: "utilities",
    icon: "FiTrash",
  },
  "swimming-pool": {
    name: "Swimming Pool",
    category: "recreational",
    icon: "FaSwimmingPool",
  },
  gym: { name: "Gym/Fitness Center", category: "fitness", icon: "FaDumbbell" },
  "children-play-area": {
    name: "Children's Play Area",
    category: "family",
    icon: "FiStar",
  },
  garden: {
    name: "Garden/Landscaped Area",
    category: "recreational",
    icon: "FaTree",
  },
  "club-house": {
    name: "Club House",
    category: "recreational",
    icon: "FiHome",
  },
  "jogging-track": {
    name: "Jogging Track",
    category: "fitness",
    icon: "FiActivity",
  },
  "visitor-parking": {
    name: "Visitor Parking",
    category: "convenience",
    icon: "FiCar",
  },
  "maintenance-staff": {
    name: "Maintenance Staff",
    category: "services",
    icon: "FiUser",
  },
  laundry: { name: "Laundry Service", category: "services", icon: "FiShirt" },
  housekeeping: { name: "Housekeeping", category: "services", icon: "FiHome" },
  wifi: { name: "Wi-Fi Connectivity", category: "technology", icon: "FiWifi" },
  "ro-water": {
    name: "RO Water System",
    category: "utilities",
    icon: "FiDroplets",
  },
  "solar-panels": { name: "Solar Panels", category: "eco", icon: "FiSun" },
  "rain-water-harvesting": {
    name: "Rain Water Harvesting",
    category: "eco",
    icon: "FiCloudRain",
  },
  "senior-citizen-area": {
    name: "Senior Citizen Area",
    category: "family",
    icon: "FiUsers",
  },
  "meditation-area": {
    name: "Meditation/Yoga Area",
    category: "wellness",
    icon: "FiHeart",
  },
};

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
 * @param {Array<string>} amenityIds - Array of amenity IDs
 * @returns {Array<Object>} Transformed amenities
 */
export function transformSocietyAmenities(amenityIds) {
  if (!Array.isArray(amenityIds)) return [];

  return amenityIds
    .map((id) => amenityMap[id])
    .filter(Boolean)
    .map((amenity) => ({
      name: amenity.name,
      available: true,
      icon: amenity.icon,
    }));
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
