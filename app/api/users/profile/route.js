import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";

export const GET = requireAuth(async (request) => {
  try {
    await connectDB();

    // Get the full user data from database
    const user = await User.findById(request.user._id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return complete user profile with all data including subscriptions
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      accountStatus: user.accountStatus,
      accountStatusReason: user.accountStatusReason,
      isVerified: user.isVerified,
      reraNumber: user.reraNumber,
      // Complete subscription data
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      freeTrialUsed: user.freeTrialUsed,
      freeTrialStartDate: user.freeTrialStartDate,
      freeTrialEndDate: user.freeTrialEndDate,
      adUnlockCredits: user.adUnlockCredits,
      // Metadata
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        user: userProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
