import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/auth";
import { cleanupTempFiles, getStorageStats } from "@/app/lib/upload";
import { handleApiError } from "@/app/lib/utils/errors";

// POST /api/admin/cleanup - Manually trigger temp file cleanup
export const POST = requireAdmin(async (req) => {
  try {
    cleanupTempFiles();
    const stats = getStorageStats();

    return NextResponse.json({
      success: true,
      message: "Temp file cleanup completed",
      storageStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// GET /api/admin/cleanup - Get cleanup status and storage stats
export const GET = requireAdmin(async (req) => {
  try {
    const stats = getStorageStats();
    const nextCleanup = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next daily cleanup

    return NextResponse.json({
      success: true,
      storageStats: stats,
      cleanup: {
        lastRan: new Date().toISOString(),
        nextScheduled: nextCleanup.toISOString(),
        autoRuns: "Every 24 hours",
        manualAvailable: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

