import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import { requireAuth } from "@/app/lib/auth";
import { paginationSchema } from "@/app/lib/validations/common";
import { AppError, handleApiError, formatZodErrors } from "@/app/lib/utils/errors";

// GET /api/users/contact-history - Get user's contact history
export const GET = requireAuth(async (req) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // 1. Validate pagination
    const validation = paginationSchema.safeParse(params);
    if (!validation.success) {
      throw new AppError("Invalid pagination parameters", 400, formatZodErrors(validation.error));
    }

    const { page, limit } = validation.data;
    const { dateFrom, dateTo, contactType } = params;

    // 2. Validate contact type if provided
    const validContactTypes = ["phone", "email", "whatsapp"];
    if (contactType && !validContactTypes.includes(contactType)) {
      throw new AppError("Invalid contact type. Must be one of: phone, email, whatsapp", 400);
    }

    const result = await UserContactHistory.getUserContactHistory(req.user.id, {
      page,
      limit,
      dateFrom,
      dateTo,
      contactType
    });

    // Mask contact values for privacy
    const maskedContacts = result.contacts.map(contact => ({
      ...contact,
      contactValue: contact.contactValue ? maskContactValue(contact.contactType, contact.contactValue) : null
    }));

    return NextResponse.json({
      success: true,
      contacts: maskedContacts,
      pagination: {
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
});

// Helper function to mask contact values for privacy
function maskContactValue(contactType, value) {
  switch (contactType) {
    case "phone":
    case "whatsapp":
      if (value.length <= 4) return value;
      return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);
    case "email":
      const [username, domain] = value.split("@");
      if (!domain) return value;
      const maskedUsername = username.length > 2
        ? username.substring(0, 2) + "*".repeat(username.length - 2)
        : username;
      return `${maskedUsername}@${domain}`;
    default:
      return value;
  }
}