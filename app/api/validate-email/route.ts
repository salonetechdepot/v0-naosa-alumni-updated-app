import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { valid: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { valid: false, message: "Invalid email format" },
        { status: 400 },
      );
    }

    const domain = email.split("@")[1];

    // You can integrate with a free email validation API here
    // Example using a free API (you'll need to sign up for an API key)
    const API_KEY = process.env.EMAIL_VALIDATION_API_KEY;

    if (API_KEY) {
      // Option 1: Use AbstractAPI (free tier: 250 requests/month)
      const response = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${email}`,
      );
      const data = await response.json();

      if (!data.is_valid_format || !data.is_mx_found) {
        return NextResponse.json({
          valid: false,
          message:
            "Please use a valid, permanent email address with a registered domain",
        });
      }

      if (data.is_disposable_email || data.is_role_email) {
        return NextResponse.json({
          valid: false,
          message: "Temporary or role-based email addresses are not allowed",
        });
      }

      return NextResponse.json({ valid: true, domain, details: data });
    }

    // Fallback: Basic MX record check using DNS lookup
    // Note: This requires additional setup in Next.js
    return NextResponse.json({ valid: true, domain });
  } catch (error) {
    console.error("Email validation error:", error);
    // On error, still accept the email to avoid blocking users
    return NextResponse.json({ valid: true });
  }
}
