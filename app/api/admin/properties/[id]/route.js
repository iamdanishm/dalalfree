import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/app/lib/email";

export async function PUT(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, ...data } = await req.json();

  let updateData = {};
  let message = "Property updated";

  switch (action) {
    case "approve":
      updateData = {
        status: "approved",
        approvedBy: session.user.id,
        approvalDate: new Date(),
        rejectionReason: null,
      };
      message = "Property approved";
      break;

    case "reject":
      updateData = {
        status: "rejected",
        rejectionReason: data.reason || "Rejected by admin",
      };
      message = "Property rejected";
      break;

    case "verify":
      updateData = {
        verified: data.verified,
        status: data.verified ? "approved" : "pending",
        approvedBy: data.verified ? session.user.id : null,
        approvalDate: data.verified ? new Date() : null,
        rejectionReason: data.verified ? null : undefined,
      };
      message = `Property KYC ${data.verified ? "verified" : "unverified"}`;
      break;

    case "feature":
      updateData = {
        featured: data.featured,
      };
      message = `Property ${data.featured ? "featured" : "unfeatured"}`;
      break;

    case "boost":
      updateData = {
        boosted: data.boosted,
      };
      message = `Property ${data.boosted ? "boosted" : "unboosted"}`;
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await Property.findByIdAndUpdate(params.id, updateData, {
    new: true,
  })
    .populate("ownerId", "name email")
    .populate("approvedBy", "name");

  if (!updated)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Send email notifications for property actions requiring owner notification
  if (action === "approve" || action === "reject") {
    try {
      const emailTemplate =
        action === "approve" ? "propertyApproval" : "propertyRejection";
      await sendEmail(updated.ownerId.email, emailTemplate, {
        ownerName: updated.ownerId.name,
        propertyTitle: updated.title,
        propertyType: updated.propertyType,
        approvedDate: updateData.approvalDate || new Date(),
        reason: updateData.rejectionReason,
      });
      console.log(`Property ${action} email sent to ${updated.ownerId.email}`);
    } catch (emailError) {
      console.error("Failed to send property email notification:", emailError);
      // Don't fail the API call if email fails
    }
  }

  // Audit log
  console.log(`Property ${params.id} ${action} by admin ${session.user.id}`);

  return NextResponse.json({
    property: updated,
    message,
    emailSent: action === "approve" || action === "reject" ? true : false,
  });
}

export async function DELETE(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reason } = await req.json();

  // Hard delete with audit
  const deleted = await Property.findByIdAndDelete(params.id);

  if (!deleted)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Audit log
  console.log(
    `Property ${params.id} hard deleted by admin ${session.user.id}: ${reason}`
  );

  return NextResponse.json({
    success: true,
    message: "Property permanently deleted",
  });
}

// GET detailed property
export async function GET(req, { params }) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const property = await Property.findById(params.id)
    .populate("ownerId", "name email phone role isVerified")
    .populate("approvedBy", "name email");

  if (!property)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  return NextResponse.json({ property });
}
