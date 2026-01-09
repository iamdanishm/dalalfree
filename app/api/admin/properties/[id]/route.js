import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Property from "@/app/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/app/lib/email";

export async function PUT(req, { params }) {
  const { id } = await params; // Next.js 16 requires awaiting params
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  console.log("Property update request:", {
    propertyId: id,
    sessionUser: session.user.id,
    sessionRole: session.user.role
  });

  const updateData = await req.json();
  console.log("Update data:", updateData);

  let message = "Property updated";
  let emailSent = false;

  // Handle approve action
  if (updateData.status === "approved" && updateData.verified === true) {
    updateData.approvedBy = session.user.id;
    updateData.approvalDate = new Date();
    updateData.rejectionReason = null; // Clear any previous rejection
    message = "Property approved and verified";

    // Send approval email
    try {
      const property = await Property.findById(id).populate("ownerId", "name email");
      if (property) {
        await sendEmail(property.ownerId.email, "propertyApproval", {
          ownerName: property.ownerId.name,
          propertyTitle: property.title,
          propertyType: property.propertyType,
          approvedDate: updateData.approvalDate,
        });
        emailSent = true;
        console.log(`Property approval email sent to ${property.ownerId.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send property approval email:", emailError);
    }
  }

  // Handle reject action
  else if (updateData.status === "rejected" && updateData.rejectionReason) {
    message = "Property rejected";

    // Send rejection email
    try {
      const property = await Property.findById(id).populate("ownerId", "name email");
      if (property) {
        await sendEmail(property.ownerId.email, "propertyRejection", {
          ownerName: property.ownerId.name,
          propertyTitle: property.title,
          propertyType: property.propertyType,
          reason: updateData.rejectionReason,
        });
        emailSent = true;
        console.log(`Property rejection email sent to ${property.ownerId.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send property rejection email:", emailError);
    }
  }

  // Handle archive action
  else if (updateData.isArchived === true) {
    updateData.archivedAt = new Date();
    updateData.archivedReason = updateData.archivedReason || "Archived by admin";
    message = "Property archived";
  }

  // Handle unarchive action
  else if (updateData.isArchived === false) {
    updateData.archivedAt = null;
    updateData.archivedReason = null;
    message = "Property unarchived";
  }

  // Check if property exists first
  const existingProperty = await Property.findById(id);
  if (!existingProperty) {
    console.log("Property not found in database:", id);
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  console.log("Property found:", {
    id: existingProperty._id,
    title: existingProperty.title,
    status: existingProperty.status,
    isArchived: existingProperty.isArchived
  });

  const updated = await Property.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("ownerId", "name email")
    .populate("approvedBy", "name");

  if (!updated) {
    console.log("findByIdAndUpdate returned null for property:", id);
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Audit log
  console.log(`Property ${id} updated by admin ${session.user.id}: ${message}`);

  return NextResponse.json({
    property: updated,
    message,
    emailSent,
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params; // Next.js 16 requires awaiting params
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reason } = await req.json();

  // Hard delete with audit
  const deleted = await Property.findByIdAndDelete(id);

  if (!deleted)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  // Audit log
  console.log(
    `Property ${id} hard deleted by admin ${session.user.id}: ${reason}`
  );

  return NextResponse.json({
    success: true,
    message: "Property permanently deleted",
  });
}

// GET detailed property
export async function GET(req, { params }) {
  const { id } = await params; // Next.js 16 requires awaiting params
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const property = await Property.findById(id)
    .populate("ownerId", "name email phone role isVerified")
    .populate("approvedBy", "name email");

  if (!property)
    return NextResponse.json({ error: "Property not found" }, { status: 404 });

  return NextResponse.json({ property });
}
