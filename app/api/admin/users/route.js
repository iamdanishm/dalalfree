import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/app/lib/models/User";

// GET /api/admin/users - Paginated user list with filters
export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const query = {};
  if (role) query.role = role;
  if (status) query.accountStatus = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .select(
      "name email phone role accountStatus accountStatusReason reraNumber partnerCommissionRate totalEarnings subscription createdAt"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Map API data to UI format
  const formattedUsers = users.map((user) => ({
    ...user,
    role:
      user.role === "user"
        ? "User"
        : user.role === "partner"
          ? "Partner"
          : user.role === "admin"
            ? "Admin"
            : user.role === "sub-admin"
              ? "Sub-Admin"
              : user.role,
    accountStatus:
      user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1),
    status:
      user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1), // Add status field for UI
  }));

  const total = await User.countDocuments(query);

  return NextResponse.json({
    users: formattedUsers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// POST /api/admin/users - Admin create user (any role: user, partner, sub-admin, admin)
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );

  const { name, email, password, phone, role = "user", reraNumber, partnerCommissionRate } = await req.json();

  // Validate required fields
  const fieldErrors = {};
  if (!name?.trim()) fieldErrors.name = "Name is required";
  if (!email?.trim()) fieldErrors.email = "Email is required";
  if (!password) fieldErrors.password = "Password is required";
  if (!phone?.trim()) fieldErrors.phone = "Phone number is required";

  // Additional validations
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Please enter a valid email address";
  }

  if (password && password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters";
  }

  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
    fieldErrors.phone = "Please enter a valid phone number";
  }

  if (role === "partner" && !reraNumber?.trim()) {
    fieldErrors.reraNumber = "RERA number is required for partners";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors,
        type: "validation_error",
      },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );

  // Hash password
  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
    reraNumber,
    partnerCommissionRate: partnerCommissionRate || (role === "partner" ? 0.9 : undefined),
    accountStatus: "active",
  });

  return NextResponse.json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      reraNumber: newUser.reraNumber,
      partnerCommissionRate: newUser.partnerCommissionRate,
      accountStatus: newUser.accountStatus,
      subscription: newUser.subscription, // Include nested subscription object (only for users)
      createdAt: newUser.createdAt,
    },
    message: `User created successfully as ${newUser.role}`,
  });
}
