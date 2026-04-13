import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Find user by invite token
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: new Date() },
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        inviteExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account setup successfully! Please log in.",
    });
  } catch (error) {
    console.error("Error setting up account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpiry: { gt: new Date() },
        isActive: true,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
