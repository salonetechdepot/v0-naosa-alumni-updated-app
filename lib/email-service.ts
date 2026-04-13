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

// Default from email
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  html,
}: SendEmailOptions) {
  if (!resend || (process.env.NODE_ENV === "development" && !resendApiKey)) {
    console.log("📧 Email would be sent (dev mode):", { to, subject });
    return { success: true, devMode: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      ...(react ? { react } : { html: html! }),
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

// Send user invitation
export async function sendUserInvitation(
  email: string,
  name: string,
  role: string,
  inviteToken: string,
  isExistingMember: boolean = false,
) {
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup?token=${inviteToken}`;

  const roleDisplay = role.replace("_", " ").toUpperCase();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to NAOSA Portal</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Hello ${name},</p>
        
        <p>You have been invited to join the NAOSA Alumni Association portal as a <strong>${roleDisplay}</strong>.</p>
        
        ${
          isExistingMember
            ? `<p>As an existing member, your account has been linked. Click the button below to set up your login credentials.</p>`
            : `<p>Click the button below to set up your account and create your password.</p>`
        }
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Set Up Your Account
          </a>
        </div>
        
        <p>This invitation link will expire in 7 days.</p>
        
        <p>If you did not expect this invitation, please ignore this email.</p>
        
        <hr style="margin: 30px 0;" />
        
        <p style="color: #6b7280; font-size: 12px;">
          NAOSA Alumni Association
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Invitation to NAOSA Portal - ${roleDisplay}`,
    html,
  });
}

// Existing email functions remain the same...
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
