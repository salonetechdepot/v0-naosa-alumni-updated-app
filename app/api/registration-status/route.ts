import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const ref = request.nextUrl.searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { error: "System reference is required" },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: {
        systemReference: ref,
      },
      select: {
        firstName: true,
        middleName: true,
        surname: true,
        status: true,
        systemReference: true,
        createdAt: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    const fullName =
      `${member.firstName} ${member.middleName || ""} ${member.surname}`.trim();

    return NextResponse.json({
      status: member.status,
      name: fullName,
      systemReference: member.systemReference,
      createdAt: member.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error checking registration status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
