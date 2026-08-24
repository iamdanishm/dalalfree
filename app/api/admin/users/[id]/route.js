import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Property from "@/app/lib/models/Property";
import { requireAdmin } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/email";
import { AppError, handleApiError } from "@/app/lib/utils/errors";

export const GET = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select(
      "name email phone role accountStatus accountStatusReason reraNumber partnerCommissionRate totalEarnings pendingWithdrawals withdrawnAmount lastWithdrawalDate subscription createdAt updatedAt partnerRequestStatus partnerRequestDate"
    ).lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Fetch property statistics
    const propertyStats = await Property.aggregate([
      { $match: { ownerId: user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    propertyStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    return NextResponse.json({
      success: true,
      user,
      propertyStats: stats
    });

  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { name, email, phone, role, accountStatus, accountStatusReason, reraNumber, partnerCommissionRate, partnerRequestStatus } = body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Whitelist allowed fields for update
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();
    if (role !== undefined) user.role = role;
    if (accountStatus !== undefined) user.accountStatus = accountStatus;
    if (accountStatusReason !== undefined) user.accountStatusReason = accountStatusReason;
    if (reraNumber !== undefined) user.reraNumber = reraNumber?.trim();
    if (partnerCommissionRate !== undefined) user.partnerCommissionRate = partnerCommissionRate;
    if (partnerRequestStatus !== undefined) user.partnerRequestStatus = partnerRequestStatus;

    await user.save();

    // Send notifications for status changes
    if (accountStatus) {
      try {
        if (accountStatus === "active") {
          await sendEmail(user.email, "accountApproval", {
            name: user.name,
            email: user.email,
            role: user.role,
          });
        } else if (accountStatus === "suspended") {
          await sendEmail(user.email, "accountRejection", {
            name: user.name,
            reason: accountStatusReason || "Account suspended by admin",
          });
        }
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      user,
      message: "User updated successfully"
    });

  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = requireAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const { id } = await params;
    const { reason } = await req.json();

    // Soft delete (suspend)
    const user = await User.findByIdAndUpdate(
      id,
      {
        accountStatus: "suspended",
        accountStatusReason: reason || "Account suspended by admin",
      },
      { new: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "User account suspended successfully",
      user
    });

  } catch (error) {
    return handleApiError(error);
  }
});