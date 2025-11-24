import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone } = body;

    const errors = [];
    if (!name) errors.push("name");
    if (!email) errors.push("email");
    if (!password) errors.push("password");
    if (!phone) errors.push("phone");

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "email", "phone", "password"],
          missing: errors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 400 }
      );

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: role || "buyer",
    });

    // Auto-login the user after registration
    const userForSession = {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    return NextResponse.json(
      {
        message: "User registered successfully",
        redirectTo: "/onboard", // Auto-redirect to onboarding
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          accountStatus: newUser.accountStatus,
          isVerified: newUser.isVerified,
          // Include subscription data (mainly for buyers)
          subscriptionStatus: newUser.subscriptionStatus,
          subscriptionStartDate: newUser.subscriptionStartDate,
          subscriptionEndDate: newUser.subscriptionEndDate,
          freeTrialUsed: newUser.freeTrialUsed,
          freeTrialStartDate: newUser.freeTrialStartDate,
          freeTrialEndDate: newUser.freeTrialEndDate,
          adUnlockCredits: newUser.adUnlockCredits,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
