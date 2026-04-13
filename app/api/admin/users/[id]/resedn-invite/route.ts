import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/admin-auth";
import { sendUserInvitation } from "@/lib/email-service";
import { nanoid } from "nanoid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Await the params - REQUIRED in Next.js 16
    const { id } = await params;

    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Super admin access required" },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "User account is inactive" },
        { status: 400 },
      );
    }

    // Generate new invite token
    const inviteToken = nanoid(64);
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7);

    // Clear password so user must set new one
    await prisma.user.update({
      where: { id: id },
      data: {
        password: "",
        inviteToken,
        inviteExpiry,
      },
    });

    // Resend invitation email
    await sendUserInvitation(
      user.email,
      user.name || user.email.split("@")[0],
      user.role,
      inviteToken,
      !!user.memberId,
    );

    return NextResponse.json({
      success: true,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
