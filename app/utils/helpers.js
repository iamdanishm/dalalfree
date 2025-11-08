// Helper functions for common operations

// Format currency values
export const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format numbers with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-IN").format(num);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-IN", {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

// Generate random ID
export const generateId = (length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const copy = {};
    Object.keys(obj).forEach((key) => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
};

// Check if value is empty (null, undefined, empty string, empty array, empty object)
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert to title case
export const toTitleCase = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Slugify string
export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

// Truncate string
export const truncate = (str, length = 100, suffix = "...") => {
  if (typeof str !== "string") return str;
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

// Get initials from name
export const getInitials = (name) => {
  if (typeof name !== "string") return "";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Check if device is mobile
export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

// Check if device is tablet
export const isTablet = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

// Check if device is desktop
export const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
};

// Get device type
export const getDeviceType = () => {
  if (isMobile()) return "mobile";
  if (isTablet()) return "tablet";
  return "desktop";
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  },

  get: (key, defaultValue = null) => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return defaultValue;
      }
    }
    return defaultValue;
  },

  remove: (key) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  },
};

// URL helpers
export const url = {
  getQueryParam: (param) => {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  setQueryParam: (param, value) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, "", url);
  },

  removeQueryParam: (param) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.pushState({}, "", url);
  },
};

// Array helpers
export const array = {
  unique: (arr) => [...new Set(arr)],

  shuffle: (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  capitalize,
  toTitleCase,
  slugify,
  truncate,
  getInitials,
  calculateDistance,
  formatFileSize,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  storage,
  url,
  array,
};
