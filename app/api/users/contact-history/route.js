import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import UserContactHistory from "@/app/lib/models/UserContactHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/users/contact-history - Get user's contact history
export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const contactType = searchParams.get("contactType");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Validate date parameters if provided
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return NextResponse.json(
        { error: "Invalid dateFrom format" },
        { status: 400 }
      );
    }

    if (dateTo && isNaN(Date.parse(dateTo))) {
      return NextResponse.json(
        { error: "Invalid dateTo format" },
        { status: 400 }
      );
    }

    // Validate contact type if provided
    const validContactTypes = ["phone", "email", "whatsapp"];
    if (contactType && !validContactTypes.includes(contactType)) {
      return NextResponse.json(
        { error: "Invalid contact type. Must be one of: phone, email, whatsapp" },
        { status: 400 }
      );
    }

    const result = await UserContactHistory.getUserContactHistory(session.user.id, {
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
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });

  } catch (error) {
    console.error("Error fetching contact history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact history",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/users/contact-history - Log contact reveal
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { propertyId, contactType, contactValue, creditsUsed } = await req.json();

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    if (!contactType) {
      return NextResponse.json(
        { error: "Contact type is required" },
        { status: 400 }
      );
    }

    if (!contactValue) {
      return NextResponse.json(
        { error: "Contact value is required" },
        { status: 400 }
      );
    }

    // Validate contact type
    const validContactTypes = ["phone", "email", "whatsapp"];
    if (!validContactTypes.includes(contactType)) {
      return NextResponse.json(
        { error: "Invalid contact type. Must be one of: phone, email, whatsapp" },
        { status: 400 }
      );
    }

    // Validate credits used
    const finalCreditsUsed = creditsUsed || 1;
    if (finalCreditsUsed < 1) {
      return NextResponse.json(
        { error: "Credits used must be at least 1" },
        { status: 400 }
      );
    }

    // Check if user has already contacted this property
    const alreadyContacted = await UserContactHistory.hasContactedProperty(
      session.user.id,
      propertyId
    );

    if (alreadyContacted) {
      return NextResponse.json(
        { error: "Contact already revealed for this property" },
        { status: 409 }
      );
    }

    const contactHistory = await UserContactHistory.logContact(
      session.user.id,
      propertyId,
      contactType,
      contactValue,
      finalCreditsUsed
    );

    // Populate property details for response
    await contactHistory.populateProperty();

    return NextResponse.json({
      success: true,
      contact: {
        ...contactHistory.toObject(),
        contactValue: maskContactValue(contactType, contactValue) // Return masked value
      },
      message: "Contact revealed successfully"
    });

  } catch (error) {
    console.error("Error logging contact:", error);

    if (error.message === "Property not found") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (error.message === "Cannot log contact for archived property") {
      return NextResponse.json(
        { error: "Cannot reveal contact for archived property" },
        { status: 400 }
      );
    }

    if (error.message === "Active subscription required to reveal contacts") {
      return NextResponse.json(
        { error: "Active subscription required to reveal contacts" },
        { status: 403 }
      );
    }

    if (error.message === "Insufficient credits") {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to log contact",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function to mask contact values for privacy
function maskContactValue(contactType, value) {
  switch (contactType) {
    case "phone":
    case "whatsapp":
      // Mask phone: show first 2 and last 2 digits
      if (value.length <= 4) return value;
      return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);

    case "email":
      // Mask email: show first 2 chars of username and domain
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