import { Resend } from "resend";
import {
  RegistrationConfirmation,
  RegistrationApproved,
  RegistrationRejected,
} from "@/emails";
import React from "react";

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default from email (use Resend's default or your verified domain)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const ASSOCIATION_EMAIL = "NAOSAkenema@gmail.com";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  // For development without Resend, log the email
  if (!resend || (process.env.NODE_ENV === "development" && !resendApiKey)) {
    console.log("📧 Email would be sent (dev mode):", {
      to,
      subject,
      from: FROM_EMAIL,
    });
    return { success: true, devMode: true };
  }

  try {
    const { data, error } = await resend!.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      react,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    console.log(`Email sent successfully to ${to}:`, data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  systemReference: string,
  registrationAmount: number,
  transactionReference: string,
) {
  const emailComponent = React.createElement(RegistrationConfirmation, {
    username: name,
    systemReference,
    registrationAmount,
    transactionReference,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  return sendEmail({
    to: email,
    subject: "NAOSA Registration Received - Pending Approval",
    react: emailComponent,
  });
}

/**
 * Send registration approval email
 */
export async function sendRegistrationApproval(
  email: string,
  name: string,
  systemReference: string,
) {
  const emailComponent = React.createElement(RegistrationApproved, {
    username: name,
    systemReference,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  return sendEmail({
    to: email,
    subject: "Congratulations! Your NAOSA Registration is Approved! 🎉",
    react: emailComponent,
  });
}

/**
 * Send registration rejection email
 */
// In lib/email-service.ts, update the rejection email function:
export async function sendRegistrationRejection(
  email: string,
  name: string,
  systemReference: string,
  reason?: string,
) {
  const emailComponent = React.createElement(RegistrationRejected, {
    username: name,
    systemReference,
    reason,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  return sendEmail({
    to: email,
    subject: "Update on Your NAOSA Registration Application",
    react: emailComponent,
  });
}
