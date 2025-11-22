// Client-side API utilities with comprehensive error handling for backend server availability
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const DEFAULT_TIMEOUT = 10000;

class APIError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}

// Backend availability state
let backendAvailable = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000;

// Check if backend is available
export const checkBackendHealth = async () => {
  const now = Date.now();

  // Return cached result if recent
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return backendAvailable;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { "Cache-Control": "no-cache" },
    });

    clearTimeout(timeoutId);
    backendAvailable = response.ok;
    lastHealthCheck = now;
    console.log(
      `Backend health check: ${backendAvailable ? "AVAILABLE" : "UNAVAILABLE"}`
    );
    return backendAvailable;
  } catch (error) {
    console.error("Backend health check failed:", error.message);
    backendAvailable = false;
    lastHealthCheck = now;
    return false;
  }
};

// Enhanced fetch with timeout and backend availability checking
const enhancedFetch = async (url, options = {}) => {
  const isHealthCheck = url.includes("/health");

  if (!isHealthCheck) {
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new NetworkError(
        "Backend server is currently unavailable. Please check your connection and try again."
      );
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout || DEFAULT_TIMEOUT
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      throw new APIError(errorMessage, response.status);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) throw error;
    if (error.name === "AbortError") {
      throw new NetworkError(
        "Request timeout. The server took too long to respond."
      );
    }
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new NetworkError(
        "Network error. Please check your internet connection."
      );
    }
    throw new NetworkError(
      "Failed to connect to the server. Please check your connection."
    );
  }
};

// API client with automatic retry and error handling
export const apiClient = {
  get: (endpoint, options = {}) =>
    apiCall(endpoint, { ...options, method: "GET" }),
  post: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint, data, options = {}) =>
    apiCall(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint, options = {}) =>
    apiCall(endpoint, { ...options, method: "DELETE" }),
};

// Core API call function with retry logic
async function apiCall(endpoint, options = {}, retryCount = 0) {
  const maxRetries = 2;

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    };

    const response = await enhancedFetch(url, fetchOptions);
    return await response.json();
  } catch (error) {
    console.error(`API call failed (${endpoint}):`, error.message);

    // Retry for network errors
    if (error instanceof NetworkError && retryCount < maxRetries) {
      console.log(`Retrying API call (${retryCount + 1}/${maxRetries})...`);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
      return apiCall(endpoint, options, retryCount + 1);
    }

    throw error;
  }
}
// Export error classes
export { APIError, NetworkError };
