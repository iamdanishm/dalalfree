import { NextResponse } from "next/server";
export const revalidate = 0;
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import bcrypt from "bcrypt";
import { REGEX } from "@/app/lib/validation";
import { requireAdmin } from "@/app/lib/auth";

import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";
import { paginationSchema } from "@/app/lib/validations/common";

// GET /api/admin/users - Paginated user list with filters
export const GET = requireAdmin(async function (req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    
    // Validate pagination params
    const result = paginationSchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) {
      throw new AppError("Invalid pagination parameters", 400, formatZodErrors(result.error));
    }

    const { page, limit, search } = result.data;
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const partnerRequest = searchParams.get("partnerRequest");

    const query = {};
    if (role) query.role = role;
    if (status) query.accountStatus = status;
    if (partnerRequest === "true") {
      query.partnerRequestStatus = "pending";
    }
    
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
        "name email phone role accountStatus accountStatusReason reraNumber partnerCommissionRate totalEarnings subscription createdAt updatedAt partnerRequestStatus partnerRequestDate"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// POST /api/admin/users - Admin create user
export const POST = requireAdmin(async function (req) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, email, password, phone, role = "user", reraNumber, partnerCommissionRate } = body;

    // Simple validation (can be replaced with a Zod adminUserSchema later)
    if (!name || !email || !password || !phone) {
      throw new AppError("Missing required fields", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

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
      },
      message: `User created successfully as ${newUser.role}`,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

