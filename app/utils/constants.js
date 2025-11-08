// Application Constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Application Settings
export const APP_CONFIG = {
  NAME: "DalalFree",
  DESCRIPTION: "Real Estate Platform",
  VERSION: "1.0.0",
  SUPPORT_EMAIL: "support@dalalfree.com",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
};

// Property Search
export const SEARCH_CONFIG = {
  MIN_PRICE: 0,
  MAX_PRICE: 100000000, // 10 crores
  PRICE_STEPS: {
    UNDER_10_LAKH: [0, 1000000],
    TEN_TO_TWENTY_LAKH: [1000000, 2000000],
    TWENTY_TO_FIFTY_LAKH: [2000000, 5000000],
    FIFTY_LAKH_TO_ONE_CRORE: [5000000, 10000000],
    ABOVE_ONE_CRORE: [10000000, 100000000],
  },
  LOCATION_SUGGESTIONS: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
  ],
};

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: {
    name: "Admin",
    permissions: [
      "read",
      "write",
      "delete",
      "manage_users",
      "manage_properties",
      "manage_settings",
    ],
  },
  BUYER: {
    name: "Buyer",
    permissions: ["read", "write", "save_properties", "contact_sellers"],
  },
  SELLER: {
    name: "Seller",
    permissions: ["read", "write", "manage_properties", "contact_buyers"],
  },
  PARTNER: {
    name: "Partner",
    permissions: ["read", "write", "collaborate", "view_reports"],
  },
};

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
  },
};

// Colors and Themes
export const COLORS = {
  PRIMARY: "#4F46E5", // indigo-600
  SECONDARY: "#6B7280", // gray-500
  SUCCESS: "#10B981", // emerald-500
  WARNING: "#F59E0B", // amber-500
  ERROR: "#EF4444", // red-500
  INFO: "#3B82F6", // blue-500
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: "dalalfree_token",
  USER_DATA: "dalalfree_user",
  THEME: "dalalfree_theme",
  LANGUAGE: "dalalfree_language",
  SEARCH_HISTORY: "dalalfree_search_history",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  DUPLICATE_EMAIL: "An account with this email already exists.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
  REGISTER_SUCCESS: "Account created successfully!",
  PROFILE_UPDATED: "Profile updated successfully.",
  PROPERTY_CREATED: "Property listed successfully.",
  PROPERTY_UPDATED: "Property updated successfully.",
  PROPERTY_DELETED: "Property removed successfully.",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "MMM DD, YYYY HH:mm",
  TIME: "HH:mm",
};

// Property Status
export const PROPERTY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SOLD: "sold",
  RENTED: "rented",
  PENDING: "pending",
};

// Property Types
export const PROPERTY_TYPES = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  VILLA: "Villa",
  COMMERCIAL: "Commercial",
  PLOT: "Plot",
  BUNGALOW: "Bungalow",
  PENTHOUSE: "Penthouse",
  STUDIO: "Studio",
};

// Sort Options
export const SORT_OPTIONS = {
  PRICE_LOW_TO_HIGH: { value: "price_asc", label: "Price: Low to High" },
  PRICE_HIGH_TO_LOW: { value: "price_desc", label: "Price: High to Low" },
  NEWEST_FIRST: { value: "newest", label: "Newest First" },
  OLDEST_FIRST: { value: "oldest", label: "Oldest First" },
  MOST_RELEVANT: { value: "relevance", label: "Most Relevant" },
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/dalalfree",
  TWITTER: "https://twitter.com/dalalfree",
  INSTAGRAM: "https://instagram.com/dalalfree",
  LINKEDIN: "https://linkedin.com/company/dalalfree",
  YOUTUBE: "https://youtube.com/dalalfree",
};

export default {
  API_CONFIG,
  APP_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  SEARCH_CONFIG,
  USER_ROLES,
  VALIDATION,
  COLORS,
  BREAKPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  PROPERTY_STATUS,
  PROPERTY_TYPES,
  SORT_OPTIONS,
  SOCIAL_LINKS,
};
