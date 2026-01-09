import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cleanupTempFiles, getStorageStats } from "@/app/lib/upload";

// POST /api/admin/cleanup - Manually trigger temp file cleanup
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "sub-admin")
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    console.log("🧹 Running manual temp file cleanup...");
    cleanupTempFiles();

    const stats = getStorageStats();

    return NextResponse.json({
      success: true,
      message: "Temp file cleanup completed",
      storageStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

// GET /api/admin/cleanup - Get cleanup status and storage stats
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "sub-admin")
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const stats = getStorageStats();
  const nextCleanup = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next daily cleanup

  return NextResponse.json({
    storageStats: stats,
    cleanup: {
      lastRan: new Date().toISOString(), // In production, store this in DB
      nextScheduled: nextCleanup.toISOString(),
      autoRuns: "Every 24 hours",
      manualAvailable: true,
    },
  });
}
