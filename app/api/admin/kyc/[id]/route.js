import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Kyc from "@/app/lib/models/Kyc";
import User from "@/app/lib/models/User";

// PUT /api/admin/kyc/[id] - Approve/reject with remarks
export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, remarks, rejectionReason } = await req.json(); // status: "approved" or "rejected"

  if (!["approved", "rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updateData = {
    status,
    reviewedBy: session.user.id,
    reviewDate: new Date(),
    remarks: remarks || "",
  };

  if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const updatedKyc = await Kyc.findByIdAndUpdate(params.id, updateData, {
    new: true,
  }).populate("userId", "name email");

  if (!updatedKyc)
    return NextResponse.json(
      { error: "KYC submission not found" },
      { status: 404 }
    );

  // Update user isVerified status based on KYC approval
  if (status === "approved") {
    await User.findByIdAndUpdate(updatedKyc.userId._id, {
      isVerified: true,
    });
  }

  // Audit log
  console.log(
    `KYC ${params.id} ${status} by admin ${session.user.id}: ${remarks}`
  );

  return NextResponse.json({
    kyc: updatedKyc,
    message: `KYC ${status} successfully`,
  });
}

// GET /api/admin/kyc/[id] - Get detailed KYC info
export async function GET(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const kyc = await Kyc.findById(params.id)
    .populate("userId", "name email phone role reraNumber createdAt")
    .populate("reviewedBy", "name email");

  if (!kyc)
    return NextResponse.json(
      { error: "KYC submission not found" },
      { status: 404 }
    );

  return NextResponse.json({ kyc });
}
