/**
 * Property creation validation schema
 * Defines required fields, data types, and validation rules
 */
export const propertyValidationSchema = {
  // Basic property info
  title: {
    required: true,
    type: "string",
    minLength: 10,
    maxLength: 150,
    pattern: /^[a-zA-Z0-9\s\-.,()]+$/,
    errorMessage:
      "Title must be 10-150 characters with only letters, numbers, and basic punctuation",
  },
  description: {
    required: true,
    type: "string",
    minLength: 50,
    maxLength: 5000,
    errorMessage: "Description must be 50-5000 characters",
  },
  subtitle: {
    required: false,
    type: "string",
    maxLength: 100,
    errorMessage: "Subtitle must be less than 100 characters",
  },
  price: {
    required: true,
    type: "number",
    min: 10000,
    max: 1000000000,
    errorMessage: "Price must be between ₹10,000 and ₹1,000,000,000",
  },
  marketRange: {
    required: false,
    type: "string",
    enum: ["budget", "mid-range", "premium", "luxury"],
    errorMessage:
      "Market range must be one of: budget, mid-range, premium, luxury",
  },
  negotiable: {
    required: false,
    type: "string",
    enum: ["Yes", "No", "Partially"],
    default: "No",
    errorMessage: "Negotiable must be Yes, No, or Partially",
  },

  // Property type and category
  propertyType: {
    required: true,
    type: "string",
    enum: [
      "apartment",
      "villa",
      "house",
      "plot",
      "commercial",
      "office",
      "shop",
      "warehouse",
      "farmhouse",
      "penthouse",
      "studio",
      "duplex",
    ],
    errorMessage: "Invalid property type",
  },
  category: {
    required: true,
    type: "string",
    enum: ["sale", "rent", "lease"],
    errorMessage: "Category must be sale, rent, or lease",
  },

  // Property specifications
  bhk: {
    required: false,
    type: "string",
    enum: ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5+"],
    errorMessage: "Invalid BHK configuration",
  },
  bathrooms: {
    required: false,
    type: "number",
    min: 1,
    max: 10,
    errorMessage: "Bathrooms must be between 1 and 10",
  },
  balcony: {
    required: false,
    type: "number",
    min: 0,
    max: 10,
    errorMessage: "Balcony count must be between 0 and 10",
  },
  furnishing: {
    required: false,
    type: "string",
    enum: ["unfurnished", "semi-furnished", "fully-furnished"],
    errorMessage:
      "Furnishing must be unfurnished, semi-furnished, or fully-furnished",
  },
  builtUpArea: {
    required: true,
    type: "number",
    min: 100,
    max: 100000,
    errorMessage: "Built-up area must be between 100 and 100,000 sq ft",
  },
  carpetArea: {
    required: true,
    type: "number",
    min: 50,
    max: 100000,
    errorMessage: "Carpet area must be between 50 and 100,000 sq ft",
  },
  floor: {
    required: true,
    type: "string",
    pattern: /^(ground|basement|[1-9][0-9]?)$/i,
    errorMessage:
      "Floor must be a number between 1-99, 'ground', or 'basement'",
  },
  totalFloors: {
    required: false,
    type: "number",
    min: 1,
    max: 100,
    errorMessage: "Total floors must be between 1 and 100",
  },
  age: {
    required: true,
    type: "number",
    min: 0,
    max: 100,
    errorMessage: "Property age must be between 0 and 100 years",
  },
  ageUnit: {
    required: false,
    type: "string",
    enum: ["years old", "months old", "new construction", "under construction"],
    default: "years old",
    errorMessage: "Invalid age unit",
  },
  parking: {
    required: true,
    type: "string",
    enum: ["none", "1", "2", "3", "4", "5+", "covered", "open", "both"],
    errorMessage: "Invalid parking option",
  },
  facing: {
    required: true,
    type: "string",
    enum: [
      "north",
      "south",
      "east",
      "west",
      "north-east",
      "north-west",
      "south-east",
      "south-west",
    ],
    errorMessage: "Facing must be a valid direction",
  },
  possessionStatus: {
    required: true,
    type: "string",
    enum: [
      "immediate",
      "within 1 month",
      "within 3 months",
      "within 6 months",
      "under construction",
    ],
    errorMessage: "Invalid possession status",
  },
  maintenance: {
    required: false,
    type: "number",
    min: 0,
    max: 100000,
    errorMessage: "Maintenance must be between ₹0 and ₹100,000 per month",
  },

  // Location information
  location: {
    required: true,
    type: "string",
    minLength: 5,
    maxLength: 200,
    errorMessage: "Location must be 5-200 characters",
  },
  address: {
    required: true,
    type: "string",
    minLength: 10,
    maxLength: 500,
    errorMessage: "Address must be 10-500 characters",
  },
  city: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-]+$/,
    errorMessage: "City must be 2-50 characters with only letters and spaces",
  },
  state: {
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-]+$/,
    errorMessage: "State must be 2-50 characters with only letters and spaces",
  },
  pincode: {
    required: true,
    type: "string",
    pattern: /^[1-9][0-9]{5}$/,
    errorMessage: "Pincode must be a valid 6-digit Indian postal code",
  },
  coordinates: {
    required: true,
    type: "object",
    properties: {
      latitude: { type: "number", min: -90, max: 90 },
      longitude: { type: "number", min: -180, max: 180 },
    },
    errorMessage: "Coordinates must include valid latitude and longitude",
  },

  // Arrays and complex data
  highlights: {
    required: false,
    type: "array",
    maxItems: 10,
    items: { type: "string", maxLength: 100 },
    errorMessage: "Highlights must be an array of strings (max 10 items)",
  },
  societyAmenities: {
    required: false,
    type: "array",
    maxItems: 30,
    items: { type: "string", maxLength: 50 },
    errorMessage:
      "Society amenities must be an array of strings (max 30 items)",
  },
  nearbyPlaces: {
    required: false,
    type: "array",
    maxItems: 20,
    items: {
      type: "object",
      properties: {
        name: { type: "string", maxLength: 100 },
        type: { type: "string", maxLength: 50 },
        distance: { type: "string", maxLength: 50 },
        rating: { type: "number", min: 0, max: 5 },
      },
    },
    errorMessage:
      "Nearby places must be an array of valid place objects (max 20 items)",
  },
};

/**
 * Validate property data against schema
 * @param {Object} data - Property data to validate
 * @returns {Object} Validation result
 */
export function validatePropertyData(data) {
  const errors = {};

  // Check required fields
  for (const [field, schema] of Object.entries(propertyValidationSchema)) {
    if (
      schema.required &&
      (data[field] === undefined || data[field] === null || data[field] === "")
    ) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if field is not provided and not required
    if (data[field] === undefined || data[field] === null) {
      continue;
    }

    // Type validation
    if (schema.type && typeof data[field] !== schema.type) {
      errors[field] = `${field} must be a ${schema.type}`;
      continue;
    }

    // String validation
    if (schema.type === "string") {
      if (schema.minLength && data[field].length < schema.minLength) {
        errors[field] =
          schema.errorMessage ||
          `${field} must be at least ${schema.minLength} characters`;
      }
      if (schema.maxLength && data[field].length > schema.maxLength) {
        errors[field] =
          schema.errorMessage ||
          `${field} must be less than ${schema.maxLength} characters`;
      }
      if (schema.pattern && !schema.pattern.test(data[field])) {
        errors[field] = schema.errorMessage || `${field} has invalid format`;
      }
    }

    // Number validation
    if (schema.type === "number") {
      if (schema.min !== undefined && data[field] < schema.min) {
        errors[field] =
          schema.errorMessage || `${field} must be at least ${schema.min}`;
      }
      if (schema.max !== undefined && data[field] > schema.max) {
        errors[field] =
          schema.errorMessage || `${field} must be less than ${schema.max}`;
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data[field])) {
      errors[field] =
        schema.errorMessage ||
        `${field} must be one of: ${schema.enum.join(", ")}`;
    }

    // Array validation
    if (schema.type === "array") {
      if (!Array.isArray(data[field])) {
        errors[field] = `${field} must be an array`;
        continue;
      }
      if (schema.maxItems && data[field].length > schema.maxItems) {
        errors[field] =
          schema.errorMessage ||
          `${field} must have no more than ${schema.maxItems} items`;
      }
      if (schema.items) {
        for (let i = 0; i < data[field].length; i++) {
          const item = data[field][i];
          if (schema.items.type && typeof item !== schema.items.type) {
            errors[field] =
              schema.errorMessage ||
              `All items in ${field} must be ${schema.items.type}`;
            break;
          }
          if (schema.items.maxLength && item.length > schema.items.maxLength) {
            errors[field] =
              schema.errorMessage ||
              `Items in ${field} must be less than ${schema.items.maxLength} characters`;
            break;
          }
        }
      }
    }

    // Object validation
    if (schema.type === "object" && schema.properties) {
      if (typeof data[field] !== "object" || Array.isArray(data[field])) {
        errors[field] = `${field} must be an object`;
        continue;
      }
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (data[field][prop] === undefined) {
          errors[field] = `${field}.${prop} is required`;
          break;
        }
        if (propSchema.type && typeof data[field][prop] !== propSchema.type) {
          errors[field] = `${field}.${prop} must be a ${propSchema.type}`;
          break;
        }
        if (
          propSchema.min !== undefined &&
          data[field][prop] < propSchema.min
        ) {
          errors[field] = `${field}.${prop} must be at least ${propSchema.min}`;
          break;
        }
        if (
          propSchema.max !== undefined &&
          data[field][prop] > propSchema.max
        ) {
          errors[
            field
          ] = `${field}.${prop} must be less than ${propSchema.max}`;
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
