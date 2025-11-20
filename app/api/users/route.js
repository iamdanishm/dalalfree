import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    // Build filter query
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with pagination
    const users = await User.find(filter)
      .select("-password") // Exclude password from results
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format users for response
    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      accountStatus: user.accountStatus,
      isVerified: user.isVerified,
      reraNumber: user.reraNumber,
      // Include subscription data
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      freeTrialUsed: user.freeTrialUsed,
      freeTrialStartDate: user.freeTrialStartDate,
      freeTrialEndDate: user.freeTrialEndDate,
      adUnlockCredits: user.adUnlockCredits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, phone, role = "buyer" } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
          required: ["name", "email", "password"],
          missing: [
            !name && "name",
            !email && "email",
            !password && "password",
          ].filter(Boolean),
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    // Format user for response (exclude password)
    const formattedUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      accountStatus: newUser.accountStatus,
      isVerified: newUser.isVerified,
      reraNumber: newUser.reraNumber,
      // Include subscription data
      subscriptionStatus: newUser.subscriptionStatus,
      subscriptionStartDate: newUser.subscriptionStartDate,
      subscriptionEndDate: newUser.subscriptionEndDate,
      freeTrialUsed: newUser.freeTrialUsed,
      freeTrialStartDate: newUser.freeTrialStartDate,
      freeTrialEndDate: newUser.freeTrialEndDate,
      adUnlockCredits: newUser.adUnlockCredits,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: formattedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
