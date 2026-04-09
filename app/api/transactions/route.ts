import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const transactionSchema = z.object({
  memberId: z.string().optional().nullable(),
  memberName: z.string().min(1),
  phone: z.string().min(1),
  amount: z.number().min(0),
  transactionReference: z.string().min(1),
  systemReference: z.string().min(1),
  type: z
    .enum(["registration", "donation", "contribution"])
    .default("registration"),
  description: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const memberId = searchParams.get("memberId");

    const where: any = {};

    if (type && ["registration", "donation", "contribution"].includes(type)) {
      where.type = type;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        member: {
          select: {
            firstName: true,
            surname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = transactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Prepare data for Prisma - convert undefined to null and ensure proper types
    const createData: any = {
      memberName: data.memberName,
      phone: data.phone,
      amount: data.amount,
      transactionReference: data.transactionReference,
      systemReference: data.systemReference,
      type: data.type,
    };

    // Only add memberId if it exists (not undefined and not null)
    if (data.memberId !== undefined && data.memberId !== null) {
      createData.memberId = data.memberId;
    }

    // Only add description if it exists
    if (data.description !== undefined && data.description !== null) {
      createData.description = data.description;
    }

    const transaction = await prisma.transaction.create({
      data: createData,
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
