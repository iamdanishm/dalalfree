// Utility functions for generating and managing slugs

import Property from "./models/Property.js";

/**
 * Generates a URL-friendly slug from text
 * @param {string} text - The text to convert to slug
 * @returns {string} The URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return "";

  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      // Replace multiple hyphens with single hyphen
      .replace(/\-\-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
}

/**
 * Generates a unique slug for a property
 * @param {string} title - The property title
 * @param {string} propertyId - Optional existing property ID to exclude from uniqueness check
 * @returns {Promise<string>} A unique slug
 */
export async function generateUniquePropertySlug(title, propertyId = null) {
  let baseSlug = generateSlug(title);
  if (!baseSlug) return "";

  // If no title provided, generate a fallback slug
  if (!title || title.trim() === "") {
    const timestamp = Date.now();
    baseSlug = `property-${timestamp}`;
  }

  let slug = baseSlug;
  let counter = 1;

  // Keep checking for uniqueness until we find an available slug
  while (true) {
    try {
      // Build query to check if slug exists
      const query = { slug };

      // Exclude the current property if updating (not creating new)
      if (propertyId) {
        query._id = { $ne: propertyId };
      }

      const existingProperty = await Property.findOne(query).exec();

      if (!existingProperty) {
        // Slug is unique, return it
        return slug;
      }

      // Slug exists, try incrementing the counter
      counter++;
      slug = `${baseSlug}-${counter}`;
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      // If there's an error, append a random suffix
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      return `${baseSlug}-${randomSuffix}`;
    }
  }
}

/**
 * Validates a slug format
 * @param {string} slug - The slug to validate
 * @returns {boolean} Whether the slug is valid
 */
export function validateSlug(slug) {
  if (!slug || typeof slug !== "string") return false;

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphens
  // Should not have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  return slugRegex.test(slug) && slug.length >= 1 && slug.length <= 200;
}

/**
 * Sanitizes a manually provided slug
 * @param {string} slug - The raw slug input
 * @returns {string} Sanitized slug
 */
export function sanitizeSlug(slug) {
  if (!slug) return "";
  return generateSlug(slug);
}
