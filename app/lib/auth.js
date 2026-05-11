// Authentication utilities - supporting both NextAuth and JWT tokens
import { connectDB } from "./db.js";
import User from "./models/User.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

// Check if user is admin
export const isAdmin = (user) => {
  return user && user.role === "admin";
};

// Check if user is user (basic user role that can buy and sell)
export const isUser = (user) => {
  return user && user.role === "user";
};

// Check if user is partner
export const isPartner = (user) => {
  return user && user.role === "partner";
};

// Check if user can list/sell properties
export const canListProperties = (user) => {
  return user && (user.role === "user" || user.role === "partner");
};

// Require authentication middleware supporting both NextAuth sessions and JWT tokens
export const requireAuth = (handler) => {
  return async (request, ...args) => {
    try {
      let user = null;
      await connectDB();

      // First, try JWT token authentication (for API testing)
      // Try different ways to access the Authorization header
      let authHeader =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
        if (!secret) {
          throw new Error("AUTH_SECRET is not defined in environment variables");
        }

        try {
          // Verify JWT token
          const decoded = jwt.verify(token, secret);

          // Get user from database using token payload
          user = await User.findById(decoded.id);
        } catch (jwtError) {
          // JWT verification failed, continue to NextAuth check
          console.log("JWT verification failed:", jwtError.message);
          console.log("JWT error details:", jwtError);
        }
      }

      // If JWT didn't work, try NextAuth session (for web app)
      if (!user) {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        // Get user from database using the session user ID
        user = await User.findById(session.user.id || session.user._id);
      }

      // Check if user exists
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Check if account is active
      if (user.accountStatus?.toLowerCase() !== "active") {
        return new Response(JSON.stringify({ error: "Account not active" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Add user to request
      request.user = user;

      // Call the handler
      return handler(request, ...args);
    } catch (error) {
      console.error("Auth error:", error);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
};

// Require Partner role middleware
export const requirePartner = (handler) => {
  return requireAuth(async (request, ...args) => {
    if (request.user.role !== "partner") {
      return new Response(JSON.stringify({ error: "Partner access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return handler(request, ...args);
  });
};

