import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { requireAuth } from "@/app/lib/auth";

export const POST = requireAuth(async (request) => {
  try {
    const user = request.user;

    // Check if user is a buyer
    if (user.role !== "buyer") {
      return NextResponse.json(
        { error: "Only buyers can convert to sellers" },
        { status: 400 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "User is already verified" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user role to seller and mark as verified
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        role: "seller",
        isVerified: true,
        accountStatus: "active",
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Successfully converted buyer to seller",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          accountStatus: updatedUser.accountStatus,
          isVerified: updatedUser.isVerified,
          // Include subscription data (subscription status may change for sellers)
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionStartDate: updatedUser.subscriptionStartDate,
          subscriptionEndDate: updatedUser.subscriptionEndDate,
          freeTrialUsed: updatedUser.freeTrialUsed,
          freeTrialStartDate: updatedUser.freeTrialStartDate,
          freeTrialEndDate: updatedUser.freeTrialEndDate,
          adUnlockCredits: updatedUser.adUnlockCredits,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request) => {
  try {
    const user = request.user;

    return NextResponse.json(
      {
        canConvert: user.role === "buyer" && !user.isVerified,
        currentRole: user.role,
        isVerified: user.isVerified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("KYC conversion status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
