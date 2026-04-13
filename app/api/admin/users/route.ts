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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true, // This works after prisma generate
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        memberId: true,
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone || null,
      name: user.name,
      role: user.role,
      status: user.isActive ? "active" : "inactive",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: null,
      memberId: user.memberId,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
