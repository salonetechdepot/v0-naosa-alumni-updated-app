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
    // Await the params - REQUIRED in Next.js 16
    const { id } = await params;

    const admin = await getSessionAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting yourself
    if (admin.userId === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last super admin
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

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
