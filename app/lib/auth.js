// Authentication utilities
import jwt from "jsonwebtoken";
import { dbHelpers } from "./db.js";

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Password hashing utilities (in a real app, use bcrypt)
export const hashPassword = async (password) => {
  // This is a simple hash for demo purposes
  // In production, use bcrypt or similar
  return `hashed_${password}_${Date.now()}`;
};

export const verifyPassword = async (password, hashedPassword) => {
  // In production, use bcrypt.compare
  return hashedPassword.includes(`hashed_${password}_`);
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware for API routes
export const authMiddleware = async (request) => {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided" };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return { error: "Invalid token" };
    }

    // Get user from database
    const user = await dbHelpers.findUserById(decoded.userId);

    if (!user) {
      return { error: "User not found" };
    }

    if (user.status !== "active") {
      return { error: "Account is not active" };
    }

    return { user, token: decoded };
  } catch (error) {
    return { error: "Authentication failed" };
  }
};

// Login function
export const login = async (email, password) => {
  try {
    // Find user by email
    const user = await dbHelpers.findUserByEmail(email);

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user is active
    if (user.status !== "active") {
      return { success: false, error: "Account is not active" };
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    return { success: false, error: "Login failed" };
  }
};

// Register function
export const register = async (userData) => {
  try {
    const { firstName, lastName, email, password, userType } = userData;

    // Check if user already exists
    const existingUser = await dbHelpers.findUserByEmail(email);

    if (existingUser) {
      return { success: false, error: "User already exists with this email" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await dbHelpers.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });

    // Generate token
    const token = generateToken(newUser);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      message: "Registration successful",
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    return { success: false, error: "Registration failed" };
  }
};

// Check if user is admin
export const isAdmin = (user) => {
  return user && user.userType === "admin";
};

// Check if user is seller
export const isSeller = (user) => {
  return user && user.userType === "seller";
};

// Check if user is buyer
export const isBuyer = (user) => {
  return user && user.userType === "buyer";
};

// Check if user is partner
export const isPartner = (user) => {
  return user && user.userType === "partner";
};

// Require authentication middleware
export const requireAuth = (handler) => {
  return async (request, ...args) => {
    const authResult = await authMiddleware(request);

    if (authResult.error) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add user to request context
    request.user = authResult.user;

    return handler(request, ...args);
  };
};

// Require specific user type
export const requireUserType = (userType) => {
  return (handler) => {
    return async (request, ...args) => {
      const authResult = await authMiddleware(request);

      if (authResult.error) {
        return new Response(
          JSON.stringify({ success: false, error: authResult.error }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (authResult.user.userType !== userType) {
        return new Response(
          JSON.stringify({ success: false, error: "Access denied" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Add user to request context
      request.user = authResult.user;

      return handler(request, ...args);
    };
  };
};

export default {
  login,
  register,
  generateToken,
  verifyToken,
  authMiddleware,
  requireAuth,
  requireUserType,
  isAdmin,
  isSeller,
  isBuyer,
  isPartner,
};
