import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/app/lib/email";

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role, accountStatus, accountStatusReason, isSubAdmin } =
    await req.json();

  // Only allow specific fields to be updated
  const updateData = {};
  if (role) updateData.role = role;
  if (accountStatus) updateData.accountStatus = accountStatus;
  if (accountStatusReason !== undefined)
    updateData.accountStatusReason = accountStatusReason;
  if (isSubAdmin !== undefined) updateData.isSubAdmin = isSubAdmin;

  const updated = await User.findByIdAndUpdate(params.id, updateData, {
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
    `Admin ${session.user.id} updated user ${params.id}:`,
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

  const { reason } = await req.json();

  // Soft delete by suspending account instead of hard delete
  const updated = await User.findByIdAndUpdate(
    params.id,
    {
      accountStatus: "suspended",
      accountStatusReason: reason || "Account suspended by admin",
    },
    { new: true }
  );

  // Audit log
  console.log(
    `User ${params.id} suspended by admin ${session.user.id}: ${reason}`
  );

  return NextResponse.json({
    success: true,
    message: "User account suspended successfully",
    user: updated,
  });
}
