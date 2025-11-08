// Type definitions for the application using JSDoc for type hints

// User Types
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {'admin'|'buyer'|'seller'|'partner'} userType
 * @property {'active'|'pending'|'inactive'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserRegistration
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 * @property {'buyer'|'seller'|'partner'} userType
 */

/**
 * @typedef {Object} UserLogin
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {User} [user]
 * @property {string} [token]
 * @property {string} [error]
 */

// Property Types
/**
 * @typedef {Object} Property
 * @property {number} id
 * @property {string} title
 * @property {number} price
 * @property {string} location
 * @property {number} bedrooms
 * @property {number} bathrooms
 * @property {number} sqft
 * @property {'House'|'Apartment'|'Villa'|'Commercial'|'Plot'} type
 * @property {string} description
 * @property {string[]} features
 * @property {string[]} images
 * @property {number} sellerId
 * @property {'active'|'inactive'|'sold'|'rented'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {{agent: string, phone: string, email: string}} [contactInfo]
 */

/**
 * @typedef {Object} PropertyFormData
 * @property {string} title
 * @property {number} price
 * @property {string} location
 * @property {number} bedrooms
 * @property {number} bathrooms
 * @property {number} sqft
 * @property {Property['type']} type
 * @property {string} description
 * @property {string[]} features
 */

/**
 * @typedef {Object} PropertySearchFilters
 * @property {string} [location]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {number} [bedrooms]
 * @property {number} [bathrooms]
 * @property {Property['type']} [type]
 * @property {'price_asc'|'price_desc'|'newest'|'oldest'} [sortBy]
 */

// Component Props Types
/**
 * @typedef {Object} NavbarProps
 * @property {User} user
 * @property {boolean} sidebarOpen
 * @property {(open: boolean) => void} setSidebarOpen
 */

/**
 * @typedef {Object} SidebarProps
 * @property {User} user
 * @property {boolean} isOpen
 * @property {(open: boolean) => void} setIsOpen
 * @property {string} currentPath
 */

/**
 * @typedef {Object} PropertyCardProps
 * @property {Property} property
 */

/**
 * @typedef {Object} InputProps
 * @property {string} [type]
 * @property {string} [label]
 * @property {string} [error]
 * @property {string} [helpText]
 * @property {string} [className]
 * @property {boolean} [required]
 * @property {any} [key]
 */

/**
 * @typedef {Object} ButtonProps
 * @property {React.ReactNode} children
 * @property {'primary'|'secondary'|'outline'|'danger'} [variant]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {boolean} [disabled]
 * @property {boolean} [loading]
 * @property {'button'|'submit'|'reset'} [type]
 * @property {string} [className]
 * @property {(e: React.MouseEvent) => void} [onClick]
 */

// API Response Types
/**
 * @template T
 * @typedef {Object} APIResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {T} [data]
 * @property {string} [error]
 * @property {Record<string, string>} [errors]
 */

/**
 * @template T
 * @typedef {APIResponse<T[]> & {pagination: {page: number, limit: number, total: number, totalPages: number}}} PaginatedResponse
 */

// Form Types
/**
 * @typedef {Record<string, string>} FormErrors
 */

/**
 * @typedef {Object} FormState
 * @property {Record<string, any>} data
 * @property {FormErrors} errors
 * @property {boolean} isSubmitting
 * @property {boolean} isDirty
 */

// Store Types
/**
 * @typedef {Object} UserStore
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {(user: User) => void} setUser
 * @property {(token: string) => void} setToken
 * @property {(loading: boolean) => void} setLoading
 * @property {(error: string) => void} setError
 * @property {() => void} clearError
 * @property {(email: string, password: string) => Promise<AuthResponse>} login
 * @property {(userData: UserRegistration) => Promise<AuthResponse>} register
 * @property {() => void} logout
 * @property {(updates: Partial<User>) => Promise<AuthResponse>} updateProfile
 * @property {() => Promise<void>} checkAuth
 */

// Constants
export const USER_TYPES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SELLER: "seller",
  PARTNER: "partner",
};

export const PROPERTY_TYPES = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  VILLA: "Villa",
  COMMERCIAL: "Commercial",
  PLOT: "Plot",
};

export const USER_STATUS = {
  ACTIVE: "active",
  PENDING: "pending",
  INACTIVE: "inactive",
};

export const PROPERTY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SOLD: "sold",
  RENTED: "rented",
};

// Navigation types
/**
 * @typedef {Object} NavigationItem
 * @property {string} name
 * @property {string} href
 * @property {string} icon
 * @property {boolean} [current]
 * @property {string[]} [userTypes]
 */

export default {};
