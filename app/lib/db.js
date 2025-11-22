import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!MONGO_URI) {
    console.error("MONGO_URI environment variable is not defined");
    throw new Error("Database configuration error: MONGO_URI missing");
  }

  try {
    connectionAttempts += 1;
    console.log(
      `Attempting to connect to database (attempt ${connectionAttempts})...`
    );

    await mongoose.connect(`${MONGO_URI}/dalalfree`, {
      // Modern Mongoose 8.0+ connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 5, // Minimum number of connections in the connection pool
    });

    connectionAttempts = 0; // Reset on successful connection
    console.log("Database connected successfully");

    // Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("Database connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Database disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("Database reconnected");
    });
  } catch (error) {
    console.error(
      `Database connection failed (attempt ${connectionAttempts}):`,
      error.message
    );

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(
        "Max connection attempts reached. Database is unavailable."
      );
      connectionAttempts = 0; // Reset for next attempts
      throw new Error(
        `Failed to connect to database after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`
      );
    }

    // Exponential backoff for retries
    const delay = Math.min(1000 * Math.pow(2, connectionAttempts - 1), 10000);
    console.log(`Retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(); // Retry
  }
};

// Helper function to check if database is available
export const isDBAvailable = () => {
  return mongoose.connection.readyState === 1;
};

// Get database connection status
export const getDBStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return {
    readyState: mongoose.connection.readyState,
    state: states[mongoose.connection.readyState] || "unknown",
    connected: mongoose.connection.readyState === 1,
  };
};
