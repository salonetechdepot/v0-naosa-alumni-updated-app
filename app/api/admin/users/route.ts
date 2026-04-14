import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getSessionAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users (including inactive ones)
    const users = await prisma.user.findMany({
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

    // Get all members that don't have associated user accounts
    const orphanedMembers = await prisma.member.findMany({
      where: {
        userId: null, // Members without User accounts
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
        userId: true,
      },
    });

    // Format users
    // For users (from User table)
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone || null,
      name: user.name,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      source: "user" as const,
      memberStatus: null,
      admissionNumber: null, // Users don't have admission numbers directly
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: null,
      memberId: user.memberId,
    }));

    // For orphaned members (from Member table)
    const formattedMembers = orphanedMembers.map((member) => ({
      id: member.id,
      email: member.email || null,
      phone: member.phone,
      name: `${member.firstName} ${member.middleName || ""} ${member.surname}`.trim(),
      role: "member" as const,
      status: member.status === "approved" ? "active" : "inactive",
      source: "member" as const,
      memberStatus: member.status,
      admissionNumber: member.admissionNumber || null,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.createdAt.toISOString(),
      lastLoginAt: null,
      memberId: member.id,
    }));

    // Combine and sort by creation date (newest first)
    const allUsers = [...formattedUsers, ...formattedMembers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
