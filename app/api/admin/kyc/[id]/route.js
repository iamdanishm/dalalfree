import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Kyc from "@/app/lib/models/Kyc";
import User from "@/app/lib/models/User";
import { sendEmail } from "@/app/lib/email";

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

  // Send email notifications for KYC status changes
  try {
    const emailTemplate =
      status === "approved" ? "kycApproval" : "kycRejection";
    await sendEmail(updatedKyc.userId.email, emailTemplate, {
      name: updatedKyc.userId.name,
      reason: rejectionReason || null,
    });
    console.log(`KYC ${status} email sent to ${updatedKyc.userId.email}`);
  } catch (emailError) {
    console.error("Failed to send KYC email notification:", emailError);
    // Don't fail the API call if email fails
  }

  // Audit log
  console.log(
    `KYC ${params.id} ${status} by admin ${session.user.id}: ${remarks}`
  );

  return NextResponse.json({
    kyc: updatedKyc,
    message: `KYC ${status} successfully`,
    emailSent: true,
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
