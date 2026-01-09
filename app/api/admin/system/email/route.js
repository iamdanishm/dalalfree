import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail, sendBulkEmails, verifyEmailConfig } from "@/app/lib/email";

// POST /api/admin/email/test - Test email configuration
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "sub-admin")
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { email, template, data } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 }
      );
    }

    // If a template is specified, send a test email using that template
    if (template && data) {
      await sendEmail(email, template, data);
    } else {
      // Send a simple test email
      await sendEmail(email, "adminNotification", {
        type: "Email Test",
        message: "This is a test email from your DalalFree admin system.",
        details: `Sent at ${new Date().toISOString()}`,
        actionUrl: `${process.env.NEXTAUTH_URL}/admin`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${email}`,
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: `Email test failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT /api/admin/email/bulk - Send bulk emails
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "sub-admin")
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { emails, template, data } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Valid emails array required" },
        { status: 400 }
      );
    }

    if (!template || !data) {
      return NextResponse.json(
        { error: "Template and data required" },
        { status: 400 }
      );
    }

    // Validate template exists
    const validTemplates = [
      "accountApproval",
      "accountRejection",
      "propertyApproval",
      "propertyRejection",
      "kycApproval",
      "kycRejection",
      "adminNotification",
    ];
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: "Invalid email template" },
        { status: 400 }
      );
    }

    console.log(`Starting bulk email to ${emails.length} recipients...`);

    // Send bulk emails
    const results = await sendBulkEmails(emails, template, data);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(
      `Bulk email completed: ${successCount} success, ${failCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Bulk email sent: ${successCount}/${emails.length} successful`,
      stats: {
        total: emails.length,
        successful: successCount,
        failed: failCount,
        results: results.slice(0, 10), // Return first 10 results for confirmation
      },
    });
  } catch (error) {
    console.error("Bulk email error:", error);
    return NextResponse.json(
      { error: `Bulk email failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET /api/admin/email/config - Get email configuration status
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "sub-admin")
  ) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  // Check SMTP configuration
  const smtpCheck = await verifyEmailConfig();

  const config = {
    smtp: {
      host: process.env.SMTP_HOST || "Not configured",
      port: process.env.SMTP_PORT || "Not configured",
      user: process.env.SMTP_USER ? "✅ Configured" : "❌ Not configured",
      configured: smtpCheck.success,
      message: smtpCheck.message,
    },
    templates: {
      available: [
        "accountApproval",
        "accountRejection",
        "propertyApproval",
        "propertyRejection",
        "kycApproval",
        "kycRejection",
        "adminNotification",
      ],
      count: 7,
    },
    features: {
      single: true,
      bulk: true,
      templates: true,
      retry: true,
      errorHandling: true,
    },
  };

  return NextResponse.json({ config });
}
