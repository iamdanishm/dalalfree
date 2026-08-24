import { requireAuth } from "../auth";
import { AppError, handleApiError } from "../utils/errors";

/**
 * Middleware to restrict access to specific roles.
 * Must be used after requireAuth (or it wraps requireAuth internally).
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
export const requireRoles = (allowedRoles) => (handler) => {
  return requireAuth(async (request, ...args) => {
    try {
      const { user } = request;

      if (!user || !allowedRoles.includes(user.role)) {
        throw new AppError(`Access denied. Required roles: ${allowedRoles.join(", ")}`, 403);
      }

      return handler(request, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  });
};

// Common role-based middlewares
export const requireAdmin = requireRoles(["admin"]);
export const requirePartner = requireRoles(["partner"]);
export const requireSubAdmin = requireRoles(["admin", "sub-admin"]);
export const requireStaff = requireRoles(["admin", "sub-admin", "partner"]);
