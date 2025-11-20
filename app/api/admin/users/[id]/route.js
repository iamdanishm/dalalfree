import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

  // Audit log - in real app, save to audit collection
  console.log(
    `User ${params.id} updated by admin ${session.user.id}:`,
    updateData
  );

  return NextResponse.json({
    user: updated,
    message: "User updated successfully",
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
