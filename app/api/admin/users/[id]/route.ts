import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/admin-auth";

export async function PUT(
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, phone, role, isActive } = await request.json();

    // Check if email is taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Check if phone is taken by another user
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          id: { not: id },
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 409 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name,
        email,
        phone: phone || null,
        role,
        isActive,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const admin = await getSessionAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (admin.userId === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // First, check if this is a User record
    let userToDelete = await prisma.user.findUnique({
      where: { id: id },
      include: { member: true },
    });

    // If not a User, check if it's a Member record
    let memberToDelete = null;
    if (!userToDelete) {
      memberToDelete = await prisma.member.findUnique({
        where: { id: id },
      });
    }

    // If neither exists, return 404
    if (!userToDelete && !memberToDelete) {
      return NextResponse.json(
        { error: "User or Member not found" },
        { status: 404 },
      );
    }

    // Handle User deletion (with optional linked Member)
    if (userToDelete) {
      if (userToDelete.role === "super_admin") {
        const superAdminCount = await prisma.user.count({
          where: { role: "super_admin", isActive: true },
        });
        if (superAdminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot delete the last super admin" },
            { status: 400 },
          );
        }
      }

      // If the user has a linked member, delete it first
      if (userToDelete.memberId) {
        await prisma.member.delete({
          where: { id: userToDelete.memberId },
        });
      }

      // Delete the user
      await prisma.user.delete({
        where: { id: id },
      });
    }

    // Handle Member deletion (orphaned member without User account)
    if (memberToDelete) {
      await prisma.member.delete({
        where: { id: id },
      });
    }

    // Fetch and return updated users list
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        memberId: true,
      },
    });

    // Also get orphaned members (members without user accounts)
    const orphanedMembers = await prisma.member.findMany({
      where: {
        userId: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        surname: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    // Format users
    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone || null,
      name: user.name,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      source: "user" as const,
      memberStatus: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: null,
      memberId: user.memberId,
    }));

    // Format orphaned members
    const formattedMembers = orphanedMembers.map((member) => ({
      id: member.id,
      email: member.email || null,
      phone: member.phone,
      name: `${member.firstName} ${member.middleName || ""} ${member.surname}`.trim(),
      role: "member" as const,
      status: member.status === "approved" ? "active" : "inactive",
      source: "member" as const,
      memberStatus: member.status,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.createdAt.toISOString(),
      lastLoginAt: null,
      memberId: member.id,
    }));

    // Combine and sort
    const allEntries = [...formattedUsers, ...formattedMembers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ success: true, users: allEntries });
  } catch (error) {
    console.error("Error deleting user/member:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error as Error).message },
      { status: 500 },
    );
  }
}
