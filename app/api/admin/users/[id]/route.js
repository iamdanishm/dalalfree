import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/app/lib/email";

export async function GET(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Await params in Next.js 15+
  const { id } = await params;

  try {
    // Fetch user details
    const user = await User.findById(id).select(
      "name email phone role accountStatus accountStatusReason reraNumber subscription createdAt updatedAt"
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch property statistics for this user
    const propertyStats = await Property.aggregate([
      { $match: { ownerId: user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to simple object
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    propertyStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    // Format user data for frontend - keep raw role for editing compatibility
    const formattedUser = {
      ...user,
      role: user.role, // Keep raw role value for form compatibility
      displayRole: user.role === "user" ? "User" :
                   user.role === "partner" ? "Partner" :
                   user.role === "sub-admin" ? "Sub-Admin" :
                   user.role === "admin" ? "Admin" : user.role,
      status: user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1),
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      user: formattedUser,
      propertyStats: stats
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Await params in Next.js 15+
  const { id } = await params;

  const { name, email, phone, role, accountStatus, accountStatusReason, reraNumber } =
    await req.json();

  // Validate required fields
  const fieldErrors = {};
  if (name !== undefined && (!name?.trim())) fieldErrors.name = "Name is required";
  if (email !== undefined && (!email?.trim())) fieldErrors.email = "Email is required";
  if (phone !== undefined && (!phone?.trim())) fieldErrors.phone = "Phone number is required";

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Please enter a valid email address";
  }

  // Phone validation
  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
    fieldErrors.phone = "Please enter a valid phone number";
  }

  // RERA validation for partners
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

  // Check if email is already taken by another user
  if (email) {
    // First get the current user's email to compare
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only check for duplicates if email is actually changing
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }
  }

  // Only allow specific fields to be updated
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim().toLowerCase();
  if (phone !== undefined) updateData.phone = phone.trim() || undefined;
  if (role !== undefined) updateData.role = role;
  if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
  if (accountStatusReason !== undefined)
    updateData.accountStatusReason = accountStatusReason;
  if (reraNumber !== undefined) updateData.reraNumber = reraNumber?.trim() || undefined;

  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  // Send email notifications for account status changes
  if (accountStatus && updated) {
    try {
      if (accountStatus === "active" && updated.accountStatus === "active") {
        // Send account approval email
        await sendEmail(updated.email, "accountApproval", {
          name: updated.name,
          email: updated.email,
          role: updated.role,
        });
        console.log(`Approval email sent to ${updated.email}`);
      } else if (
        accountStatus === "suspended" &&
        updated.accountStatus === "suspended"
      ) {
        // Send account rejection/suspension email
        await sendEmail(updated.email, "accountRejection", {
          name: updated.name,
          reason: accountStatusReason || "Account suspended by admin",
        });
        console.log(`Rejection email sent to ${updated.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the API call if email fails
    }
  }

  // Log admin action
  console.log(
    `Admin ${session.user.id} updated user ${id}:`,
    updateData
  );

  return NextResponse.json({
    user: updated,
    message: "User updated successfully",
    emailSent: accountStatus ? true : false,
  });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Await params in Next.js 15+
  const { id } = await params;

  const { reason } = await req.json();

  // Soft delete by suspending account instead of hard delete
  const updated = await User.findByIdAndUpdate(
    id,
    {
      accountStatus: "suspended",
      accountStatusReason: reason || "Account suspended by admin",
    },
    { new: true }
  );

  // Audit log
  console.log(
    `User ${id} suspended by admin ${session.user.id}: ${reason}`
  );

  return NextResponse.json({
    success: true,
    message: "User account suspended successfully",
    user: updated,
  });
}