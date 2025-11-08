// Validation functions for form inputs and data validation

import { VALIDATION } from "./constants.js";

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  if (!VALIDATION.EMAIL.PATTERN.test(email)) {
    return "Please enter a valid email address";
  }

  return null; // No error
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters long`;
  }

  if (VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (VALIDATION.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  if (
    VALIDATION.PASSWORD.REQUIRE_SPECIAL_CHARS &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return "Password must contain at least one special character";
  }

  return null; // No error
};

// Name validation
export const validateName = (name, fieldName = "Name") => {
  if (!name) {
    return `${fieldName} is required`;
  }

  if (name.length < VALIDATION.NAME.MIN_LENGTH) {
    return `${fieldName} must be at least ${VALIDATION.NAME.MIN_LENGTH} characters long`;
  }

  if (name.length > VALIDATION.NAME.MAX_LENGTH) {
    return `${fieldName} must be no more than ${VALIDATION.NAME.MAX_LENGTH} characters long`;
  }

  return null; // No error
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) {
    return "Phone number is required";
  }

  // Remove all non-numeric characters for validation
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length < 10) {
    return "Phone number must be at least 10 digits long";
  }

  if (cleanPhone.length > 15) {
    return "Phone number must be no more than 15 digits long";
  }

  return null; // No error
};

// Price validation
export const validatePrice = (price) => {
  if (price === "" || price === null || price === undefined) {
    return "Price is required";
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    return "Price must be a valid number";
  }

  if (numPrice < 0) {
    return "Price cannot be negative";
  }

  if (numPrice > 1000000000) {
    // 100 crores
    return "Price seems too high. Please check and try again";
  }

  return null; // No error
};

// Area validation (sqft)
export const validateArea = (area) => {
  if (area === "" || area === null || area === undefined) {
    return "Area is required";
  }

  const numArea = Number(area);

  if (isNaN(numArea)) {
    return "Area must be a valid number";
  }

  if (numArea < 1) {
    return "Area must be greater than 0";
  }

  if (numArea > 100000) {
    return "Area seems too large. Please check and try again";
  }

  return null; // No error
};

// Property title validation
export const validatePropertyTitle = (title) => {
  if (!title) {
    return "Property title is required";
  }

  if (title.length < 5) {
    return "Property title must be at least 5 characters long";
  }

  if (title.length > 100) {
    return "Property title must be no more than 100 characters long";
  }

  return null; // No error
};

// Property description validation
export const validatePropertyDescription = (description) => {
  if (!description) {
    return "Property description is required";
  }

  if (description.length < 20) {
    return "Property description must be at least 20 characters long";
  }

  if (description.length > 1000) {
    return "Property description must be no more than 1000 characters long";
  }

  return null; // No error
};

// Location validation
export const validateLocation = (location) => {
  if (!location) {
    return "Location is required";
  }

  if (location.length < 2) {
    return "Location must be at least 2 characters long";
  }

  if (location.length > 100) {
    return "Location must be no more than 100 characters long";
  }

  return null; // No error
};

// Number validation
export const validateNumber = (value, fieldName = "Value") => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }

  return null; // No error
};

// Integer validation
export const validateInteger = (value, fieldName = "Value") => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (!Number.isInteger(numValue)) {
    return `${fieldName} must be a whole number`;
  }

  if (numValue < 0) {
    return `${fieldName} cannot be negative`;
  }

  return null; // No error
};

// URL validation
export const validateUrl = (url) => {
  if (!url) {
    return null; // URL is optional
  }

  try {
    new URL(url);
    return null; // No error
  } catch {
    return "Please enter a valid URL";
  }
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    required = false,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  } = options;

  if (!file) {
    return required ? "File is required" : null;
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `File size must be less than ${maxSizeMB}MB`;
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return "Invalid file type. Please upload a supported image format";
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return `File must have one of these extensions: ${allowedExtensions.join(
      ", "
    )}`;
  }

  return null; // No error
};

// Form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    // Required validation
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
      isValid = false;
      return;
    }

    // Skip other validations if field is empty and not required
    if (
      (value === undefined || value === null || value === "") &&
      !rules.required
    ) {
      return;
    }

    // Custom validation function
    if (rules.custom) {
      const error = rules.custom(value, formData);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Login form validation
export const validateLoginForm = (formData) => {
  const rules = {
    email: {
      required: true,
      custom: validateEmail,
    },
    password: {
      required: true,
    },
  };

  return validateForm(formData, rules);
};

// Registration form validation
export const validateRegistrationForm = (formData) => {
  const rules = {
    firstName: {
      required: true,
      custom: (value) => validateName(value, "First name"),
    },
    lastName: {
      required: true,
      custom: (value) => validateName(value, "Last name"),
    },
    email: {
      required: true,
      custom: validateEmail,
    },
    password: {
      required: true,
      custom: validatePassword,
    },
    confirmPassword: {
      required: true,
      custom: (value, formData) => {
        if (value !== formData.password) {
          return "Passwords do not match";
        }
        return null;
      },
    },
    userType: {
      required: true,
    },
  };

  return validateForm(formData, rules);
};

// Property form validation
export const validatePropertyForm = (formData) => {
  const rules = {
    title: {
      required: true,
      custom: validatePropertyTitle,
    },
    price: {
      required: true,
      custom: validatePrice,
    },
    location: {
      required: true,
      custom: validateLocation,
    },
    bedrooms: {
      required: true,
      custom: (value) => validateInteger(value, "Bedrooms"),
    },
    bathrooms: {
      required: true,
      custom: (value) => validateInteger(value, "Bathrooms"),
    },
    sqft: {
      required: true,
      custom: validateArea,
    },
    type: {
      required: true,
    },
    description: {
      required: true,
      custom: validatePropertyDescription,
    },
  };

  return validateForm(formData, rules);
};

// Profile update validation
export const validateProfileForm = (formData) => {
  const rules = {
    firstName: {
      required: true,
      custom: (value) => validateName(value, "First name"),
    },
    lastName: {
      required: true,
      custom: (value) => validateName(value, "Last name"),
    },
    email: {
      required: true,
      custom: validateEmail,
    },
    phone: {
      required: false,
      custom: validatePhone,
    },
  };

  return validateForm(formData, rules);
};

// Password change validation
export const validatePasswordChangeForm = (formData) => {
  const rules = {
    currentPassword: {
      required: true,
    },
    newPassword: {
      required: true,
      custom: validatePassword,
    },
    confirmPassword: {
      required: true,
      custom: (value, formData) => {
        if (value !== formData.newPassword) {
          return "New passwords do not match";
        }
        return null;
      },
    },
  };

  return validateForm(formData, rules);
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validatePrice,
  validateArea,
  validatePropertyTitle,
  validatePropertyDescription,
  validateLocation,
  validateNumber,
  validateInteger,
  validateUrl,
  validateFile,
  validateForm,
  validateLoginForm,
  validateRegistrationForm,
  validatePropertyForm,
  validateProfileForm,
  validatePasswordChangeForm,
};
