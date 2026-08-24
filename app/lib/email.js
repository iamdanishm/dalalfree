import nodemailer from "nodemailer";
import { emailTemplates } from "./email/templates";

// Create email transporter - will use environment variables for SMTP
const createTransporter = () => {
  // Return early if SMTP is not configured (prevent crashes in dev)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("⚠️ SMTP credentials missing. Email service will only log to console.");
    return {
      sendMail: (options) => {
        console.log("📨 [MOCK EMAIL SEND]");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        return Promise.resolve({ messageId: "mock-id-" + Date.now() });
      },
      verify: () => Promise.resolve(true),
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a single email using a template
 */
export const sendEmail = async (to, templateName, data) => {
  try {
    const transporter = createTransporter();
    const template = emailTemplates[templateName];

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(data);

    const mailOptions = {
      from: `"DalalFree" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
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

/**
 * Send bulk emails with rate limiting
 */
export const sendBulkEmails = async (emails, templateName, data) => {
  const results = [];
  const batchSize = 5; // Smaller batch size for safety

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

    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

/**
 * Verify SMTP connection
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();

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
