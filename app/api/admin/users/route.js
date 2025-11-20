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
      "name email phone role isSubAdmin accountStatus accountStatusReason reraNumber isVerified createdAt"
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
        ? "Buyer"
        : user.role === "partner"
        ? "Partner"
        : user.role === "admin"
        ? "Admin"
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

// POST /api/admin/users - Admin create user (any role: buyer, seller, partner, admin, sub-admin: buyer, seller, partner, admin, sub-admin)
export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );

  const { name, email, password, phone, role = "buyer" } = await req.json();

  // Validate required fields
  const errors = [];
  if (!name) errors.push("name");
  if (!email) errors.push("email");
  if (!password) errors.push("password");

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        required: ["name", "email", "password"],
        missing: errors,
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
    isSubAdmin: role === "admin" && true, // Set isSubAdmin for admin roles
    accountStatus: "active",
  });

  return NextResponse.json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      accountStatus: newUser.accountStatus,
      isVerified: newUser.isVerified,
      isSubAdmin: newUser.isSubAdmin,
      createdAt: newUser.createdAt,
    },
    message: `User created successfully as ${newUser.role}`,
  });
}
