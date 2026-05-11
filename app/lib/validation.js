/**
 * Shared validation utilities for the Dalalfree project.
 */

export const REGEX = {
  // Basic email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // International phone number validation (E.164-ish)
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  
  // RERA registration number format (generic check)
  RERA: /^[A-Z0-9-\/ ]{5,50}$/i,
};

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return email && REGEX.EMAIL.test(email);
};

/**
 * Validates a phone number.
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return !phone || REGEX.PHONE.test(phone);
};
