// app/api/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { standardizeAmount } from "@/lib/currency";

const prisma = new PrismaClient();

// Helper to generate system reference
function generateSystemReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `NAOSA-${timestamp}-${random}`;
}

// Validation schema for registration
const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  surname: z.string().min(1, "Surname is required"),
  gender: z.enum(["male", "female"]),
  currentAddress: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required").default("Sierra Leone"),
  admissionNumber: z.string().optional().nullable(),
  dateOfEntry: z.string().min(1, "Date of entry is required"),
  dateOfExit: z.string().min(1, "Date of exit is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().min(6, "Phone number is required"),
  registrationAmount: z.number().min(0, "Amount must be positive"),
  transactionReference: z.string().min(1, "Transaction reference is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    // Standardize the amount (convert Old Leone to New Leone if needed)
    const standardizedAmount = standardizeAmount(data.registrationAmount);

    const systemReference = generateSystemReference();
    const memberName =
      `${data.firstName} ${data.middleName || ""} ${data.surname}`
        .trim()
        .replace(/\s+/g, " ");

    // Check if member already exists
    const existingMember = await prisma.member.findFirst({
      where: {
        OR: [
          { email: data.email || undefined },
          { phone: data.phone },
          { transactionReference: data.transactionReference },
        ],
      },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          error:
            "Member with this email, phone, or transaction reference already exists",
        },
        { status: 409 },
      );
    }

    // Create member and transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create member with standardized amount
      const member = await tx.member.create({
        data: {
          firstName: data.firstName,
          middleName: data.middleName || null,
          surname: data.surname,
          gender: data.gender,
          currentAddress: data.currentAddress,
          city: data.city,
          country: data.country,
          admissionNumber: data.admissionNumber || null,
          dateOfEntry: new Date(data.dateOfEntry),
          dateOfExit: new Date(data.dateOfExit),
          email: data.email || null,
          phone: data.phone,
          registrationAmount: standardizedAmount, // Use standardized amount
          transactionReference: data.transactionReference,
          systemReference: systemReference,
          status: "pending",
        },
      });

      // Create transaction record with standardized amount
      const transaction = await tx.transaction.create({
        data: {
          memberId: member.id,
          memberName: memberName,
          phone: data.phone,
          amount: standardizedAmount, // Use standardized amount
          transactionReference: data.transactionReference,
          systemReference: systemReference,
          type: "registration",
        },
      });

      return { member, transaction };
    });

    return NextResponse.json(
      {
        success: true,
        member: result.member,
        message: "Registration submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 },
    );
  }
}

// GET endpoint to check registration status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference number required" },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { systemReference: reference },
      select: {
        firstName: true,
        surname: true,
        status: true,
        createdAt: true,
        systemReference: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 },
    );
  }
}
