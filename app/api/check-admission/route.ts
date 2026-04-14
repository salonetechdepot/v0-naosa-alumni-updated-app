import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const number = request.nextUrl.searchParams.get("number");

    if (!number) {
      return NextResponse.json({ exists: false });
    }

    const existingMember = await prisma.member.findUnique({
      where: {
        admissionNumber: number,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ exists: !!existingMember });
  } catch (error) {
    console.error("Error checking admission number:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
