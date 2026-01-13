import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Property from "@/app/lib/models/Property";
import UserFavorites from "@/app/lib/models/UserFavorites";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/users/activity - Get user's real activity metrics
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user properties count
    const userProperties = await Property.find({
      ownerId: userId,
      isArchived: { $ne: true }
    }).select('status createdAt');

    const totalPropertiesPosted = userProperties.length;
    const activePropertiesCount = userProperties.filter(p =>
      p.status === 'approved'
    ).length;

    // Get favorites count
    const favoritesCount = await UserFavorites.countDocuments({
      userId,
      // Only count favorites where property still exists and is not archived
      propertyId: {
        $in: await Property.find({ isArchived: { $ne: true } }).distinct("_id")
      }
    });

    // Get contact history count and stats
    const contactHistoryStats = await UserContactHistory.getUserContactStats(userId);
    const totalContactsRevealed = contactHistoryStats.totalContacts;

    // Get current user subscription info
    const user = await User.findById(userId).select('subscription');
    const creditsRemaining = user?.subscription?.adUnlockCredits || 0;

    // Get recent activity (last 5 activities across all types)
    const recentActivity = await getRecentActivity(userId);

    const activityMetrics = {
      totalPropertiesPosted,
      activePropertiesCount,
      totalFavoritesCount: favoritesCount,
      totalContactsRevealed,
      creditsRemaining,
      recentActivity
    };

    return NextResponse.json({
      success: true,
      metrics: activityMetrics
    });

  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activity metrics",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function to get recent activity across all user interactions
async function getRecentActivity(userId) {
  const activities = [];

  try {
    // Get recent properties posted (last 3)
    const recentProperties = await Property.find({
      ownerId: userId,
      isArchived: { $ne: true }
    })
    .select('title createdAt propertyType category')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    recentProperties.forEach(property => {
      activities.push({
        type: "posted",
        propertyTitle: property.title,
        propertyType: property.propertyType,
        category: property.category,
        timestamp: property.createdAt
      });
    });

    // Get recent favorites (last 3)
    const recentFavorites = await UserFavorites.find({ userId })
      .populate({
        path: "propertyId",
        select: "title propertyType category",
        match: { isArchived: { $ne: true } }
      })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();

    recentFavorites.forEach(favorite => {
      if (favorite.propertyId) { // Only if property still exists
        activities.push({
          type: "favorited",
          propertyTitle: favorite.propertyId.title,
          propertyType: favorite.propertyId.propertyType,
          category: favorite.propertyId.category,
          timestamp: favorite.addedAt
        });
      }
    });

    // Get recent contacts (last 3)
    const recentContacts = await UserContactHistory.find({ userId })
      .populate({
        path: "propertyId",
        select: "title propertyType category",
        match: { isArchived: { $ne: true } }
      })
      .sort({ contactRevealedAt: -1 })
      .limit(3)
      .lean();

    recentContacts.forEach(contact => {
      if (contact.propertyId) { // Only if property still exists
        activities.push({
          type: "contacted",
          propertyTitle: contact.propertyId.title,
          propertyType: contact.propertyId.propertyType,
          category: contact.propertyId.category,
          contactType: contact.contactType,
          timestamp: contact.contactRevealedAt
        });
      }
    });

    // Sort all activities by timestamp (most recent first) and take top 5
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, 5);

  } catch (error) {
    console.error("Error getting recent activity:", error);
    return []; // Return empty array on error
  }
}