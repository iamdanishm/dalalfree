import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";

export const PUT = requireAuth(async (request) => {
  try {
    await connectDB();

    const { name, phone } = await request.json();

    // Validate input
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Invalid name provided" },
        { status: 400 }
      );
    }

    if (phone && (typeof phone !== "string" || phone.trim().length === 0)) {
      return NextResponse.json(
        { error: "Invalid phone number provided" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      request.user._id,
      {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return updated user profile
    const userProfile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      accountStatus: updatedUser.accountStatus,
      accountStatusReason: updatedUser.accountStatusReason,
      isVerified: updatedUser.isVerified,
      reraNumber: updatedUser.reraNumber,
      subscriptionStatus: updatedUser.subscriptionStatus,
      subscriptionStartDate: updatedUser.subscriptionStartDate,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      freeTrialUsed: updatedUser.freeTrialUsed,
      freeTrialStartDate: updatedUser.freeTrialStartDate,
      freeTrialEndDate: updatedUser.freeTrialEndDate,
      adUnlockCredits: updatedUser.adUnlockCredits,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        user: userProfile,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

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
