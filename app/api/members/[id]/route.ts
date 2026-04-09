import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        surname: true,
        gender: true,
        currentAddress: true,
        city: true,
        country: true,
        admissionNumber: true,
        dateOfEntry: true,
        dateOfExit: true,
        email: true,
        phone: true,
        registrationAmount: true,
        transactionReference: true,
        systemReference: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = statusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const { status } = validationResult.data;

    const member = await prisma.member.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    // If approved, update the associated user role to 'member'
    if (status === "approved" && member.userId) {
      await prisma.user.update({
        where: { id: member.userId },
        data: { role: "member" },
      });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Delete member (transactions will be deleted due to cascade)
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 },
    );
  }
}
