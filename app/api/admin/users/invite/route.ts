import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/admin-auth";
import { sendUserInvitation } from "@/lib/email-service";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
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

    const { email, phone, name, role, memberId } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: phone || undefined }],
      },
    });

    if (existingUser) {
      if (existingUser.isActive) {
        return NextResponse.json(
          {
            error: "User with this email or phone already exists and is active",
          },
          { status: 409 },
        );
      }

      // Reactivate existing user
      const inviteToken = nanoid(64);
      const inviteExpiry = new Date();
      inviteExpiry.setDate(inviteExpiry.getDate() + 7);

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          role: role || existingUser.role,
          isActive: true,
          inviteToken,
          inviteExpiry,
          ...(phone && { phone }),
        },
      });

      await sendUserInvitation(
        email,
        name,
        updatedUser.role,
        inviteToken,
        !!updatedUser.memberId,
      );

      return NextResponse.json({
        success: true,
        message: "User reactivated and invitation sent",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      });
    }

    // Check if this email belongs to an existing member
    let member = null;
    if (!memberId) {
      member = await prisma.member.findFirst({
        where: {
          OR: [{ email }, { phone: phone || undefined }],
        },
      });
    } else if (memberId) {
      member = await prisma.member.findUnique({
        where: { id: memberId },
      });
    }

    // Generate invite token
    const inviteToken = nanoid(64);
    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        name,
        password: "", // Will be set during setup
        role: role || "user",
        isActive: true,
        inviteToken,
        inviteExpiry,
        ...(member && { memberId: member.id }),
      },
    });

    // Send invitation email
    await sendUserInvitation(email, name, newUser.role, inviteToken, !!member);

    return NextResponse.json({
      success: true,
      message: member
        ? "User created and linked to existing member. Invitation sent."
        : "User created and invitation sent successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        linkedToMember: !!member,
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
