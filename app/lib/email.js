import nodemailer from "nodemailer";

// Create email transporter - will use environment variables for SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email
      pass: process.env.SMTP_PASS, // your email password or app password
    },
    // Additional security settings
    tls: {
      rejectUnauthorized: false, // For development, consider removing in production
    },
  });
};

// Email templates
const emailTemplates = {
  accountApproval: (data) => ({
    subject: "Account Approved - Welcome to DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Account Approved! ✅</h2>
        <p>Dear ${data.name},</p>
        <p>Your account has been approved and is now active on DalalFree.</p>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Role:</strong> ${data.role}</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        <p>You can now:</p>
        <ul>
          ${
            data.role === "seller" || data.role === "partner"
              ? "<li>List and manage properties</li>"
              : ""
          }
          ${data.role === "buyer" ? "<li>Browse and contact sellers</li>" : ""}
          ${data.role === "partner" ? "<li>Access partner dashboard</li>" : ""}
        </ul>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `Account Approved!\n\nDear ${data.name},\n\Your account has been approved. Login with ${data.email}\n\nBest regards,\nDalalFree Admin Team`,
  }),

  accountRejection: (data) => ({
    subject: "Account Status Update - DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Account Status Update</h2>
        <p>Dear ${data.name},</p>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p>We regret to inform you that your account application has been rejected.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <p>If you believe this is an error, please contact our support team.</p>
        </div>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `Account Rejected\n\nDear ${
      data.name
    },\nYour account was rejected.\n${
      data.reason ? `Reason: ${data.reason}` : ""
    }\n\nBest regards,\nDalalFree Admin Team`,
  }),

  propertyApproval: (data) => ({
    subject: "Property Approved - DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Property Approved! ✅</h2>
        <p>Dear ${data.ownerName},</p>
        <p>Great news! Your property has been approved and is now live on DalalFree.</p>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Property Details:</h3>
          <p><strong>Title:</strong> ${data.propertyTitle}</p>
          <p><strong>Type:</strong> ${data.propertyType}</p>
          <p><strong>Approved Date:</strong> ${new Date(
            data.approvedDate
          ).toLocaleDateString()}</p>
        </div>

        <p>Your property is now visible to potential buyers and you can manage it through your dashboard.</p>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `Property Approved!\n\nDear ${data.ownerName},\nYour property "${data.propertyTitle}" has been approved.\n\nBest regards,\nDalalFree Admin Team`,
  }),

  propertyRejection: (data) => ({
    subject: "Property Requires Updates - DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Property Update Required</h2>
        <p>Dear ${data.ownerName},</p>

        <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p>Your property submission requires some updates before it can be approved.</p>
          <p><strong>Property:</strong> ${data.propertyTitle}</p>
          ${
            data.reason
              ? `<p><strong>Feedback:</strong> ${data.reason}</p>`
              : ""
          }
          <p>Please update your property details and resubmit for approval.</p>
        </div>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `Property Update Required\n\nDear ${
      data.ownerName
    },\nYour property "${data.propertyTitle}" requires updates.\n${
      data.reason || ""
    }\n\nBest regards,\nDalalFree Admin Team`,
  }),

  kycApproval: (data) => ({
    subject: "KYC Approved - Enhanced Account Features",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">KYC Verification Complete! ✅</h2>
        <p>Dear ${data.name},</p>
        <p>Excellent! Your KYC verification has been approved. You now have access to enhanced features.</p>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Enhanced Features Now Available:</h3>
          <p>✓ Premium listings</p>
          <p>✓ Advanced analytics</p>
          <p>✓ Priority support</p>
          <p>✓ Increased visibility</p>
        </div>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `KYC Approved!\n\nDear ${data.name},\nYour KYC has been approved. You now have access to premium features.\n\nBest regards,\nDalalFree Admin Team`,
  }),

  kycRejection: (data) => ({
    subject: "KYC Verification Update - DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">KYC Verification Update</h2>
        <p>Dear ${data.name},</p>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p>Your KYC verification could not be approved.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <p>Please upload proper documentation and contact support if you need assistance.</p>
        </div>

        <p>Best regards,<br>DalalFree Admin Team</p>
      </div>
    `,
    text: `KYC Update\n\nDear ${
      data.name
    },\nYour KYC verification was not approved.\n${
      data.reason || ""
    }\n\nBest regards,\nDalalFree Admin Team`,
  }),

  passwordResetOtp: (data) => ({
    subject: "Password Reset OTP - DalalFree",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">DalalFree</h1>
          <p style="color: #e2e8f0; margin: 5px 0 0 0; font-size: 16px;">Secure Password Reset</p>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #1a202c; margin: 0 0 20px 0; text-align: center;">Reset Your Password</h2>

          <p style="color: #4a5568; margin: 0 0 30px 0; text-align: center; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Use the verification code below to proceed:
          </p>

          <div style="background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Your Verification Code</h3>
            <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${data.otp}
            </div>
          </div>

          <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0; font-size: 14px; text-align: center;">
              <strong>⚠️ Important:</strong> This code will expire in 15 minutes for security reasons.
            </p>
          </div>

          <p style="color: #718096; margin: 20px 0; text-align: center; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              For your security, please do not share this code with anyone.
            </p>
          </div>
        </div>

        <div style="background: #f7fafc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; margin: 0; font-size: 14px;">
            Best regards,<br>
            <strong>The DalalFree Team</strong>
          </p>
        </div>
      </div>
    `,
    text: `Password Reset - DalalFree\n\nYour verification code: ${data.otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this reset, please ignore this email.\n\nBest regards,\nDalalFree Team`,
  }),

  adminNotification: (data) => ({
    subject: `DalalFree Alert: ${data.type}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Admin System Alert</h2>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Message:</strong> ${data.message}</p>
        ${
          data.details ? `<p><strong>Details:</strong> ${data.details}</p>` : ""
        }

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <a href="${
            data.actionUrl
          }" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Action</a>
        </div>

        <p>Best regards,<br>DalalFree System</p>
      </div>
    `,
    text: `Admin Alert: ${data.type}\nMessage: ${data.message}\nAction: ${data.actionUrl}`,
  }),
};

// Send single email
export const sendEmail = async (to, templateName, data) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName];

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(data);

    const mailOptions = {
      from: `"DalalFree" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

// Send bulk emails with rate limiting
export const sendBulkEmails = async (emails, templateName, data) => {
  const results = [];
  const batchSize = 10; // Limit concurrent sends

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchPromises = batch.map((email) =>
      sendEmail(email, templateName, data)
        .then((result) => ({ email, ...result }))
        .catch((error) => ({ email, success: false, error: error.message }))
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(
      ...batchResults.map((result) =>
        result.status === "fulfilled" ? result.value : result.reason
      )
    );

    // Delay between batches to avoid rate limits
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

// Verify SMTP connection
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    const result = await transporter.verify();

    return {
      success: true,
      message: "SMTP connection successful",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

const emailService = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
};

export default emailService;
