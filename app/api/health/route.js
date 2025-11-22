import { NextResponse } from "next/server";
import { connectDB, isDBAvailable, getDBStatus } from "@/app/lib/db";

// GET /api/health - Check backend server availability
export async function GET() {
  try {
    // Check database connection
    let dbStatus = "unknown";
    let dbState = null;
    try {
      await connectDB();
      const status = getDBStatus();
      dbStatus = status.state;
      dbState = status.readyState;
    } catch (dbError) {
      console.warn("Health check - Database error:", dbError.message);
      dbStatus = "error";
      dbState = -1;
    }

    // Basic health information
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      database: {
        status: dbStatus,
        connected: dbState === 1,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        platform: process.platform,
      },
    };

    // If database is connected, everything is good
    if (dbState === 1) {
      return NextResponse.json(healthData, { status: 200 });
    }

    // If database is not available but server is responding, return degraded status
    healthData.status = "degraded";
    healthData.database.error = "Database connection failed";
    return NextResponse.json(healthData, { status: 503 });
  } catch (error) {
    console.error("Health check failed:", error);

    // Server is having critical issues
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Server health check failed",
        message: error.message,
      },
      { status: 503 }
    );
  }
}
