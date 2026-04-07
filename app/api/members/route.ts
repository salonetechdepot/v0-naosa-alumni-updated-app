import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";

// Helper to generate system reference
function generateSystemReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `NAOSA-${timestamp}-${random}`;
}

// Validation schema for member creation
const memberSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  surname: z.string().min(1),
  gender: z.enum(["male", "female"]),
  currentAddress: z.string().min(1),
  city: z.string().min(1),
  country: z.string().optional().default("Sierra Leone"),
  admissionNumber: z.string().optional().nullable(),
  dateOfEntry: z.string().min(1),
  dateOfExit: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6),
  registrationAmount: z.number().min(0),
  transactionReference: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where =
      status && ["pending", "approved", "rejected"].includes(status)
        ? { status: status as any }
        : {};

    const members = await prisma.member.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
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

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = memberSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const systemReference = generateSystemReference();
    const memberName =
      `${data.firstName} ${data.middleName || ""} ${data.surname}`.trim();

    // Create member and transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          firstName: data.firstName,
          middleName: data.middleName,
          surname: data.surname,
          gender: data.gender,
          currentAddress: data.currentAddress,
          city: data.city,
          country: data.country,
          admissionNumber: data.admissionNumber,
          dateOfEntry: new Date(data.dateOfEntry),
          dateOfExit: new Date(data.dateOfExit),
          email: data.email,
          phone: data.phone,
          registrationAmount: data.registrationAmount,
          transactionReference: data.transactionReference,
          systemReference: systemReference,
          status: "pending",
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          memberId: member.id,
          memberName: memberName,
          phone: data.phone,
          amount: data.registrationAmount,
          transactionReference: data.transactionReference,
          systemReference: systemReference,
          type: "registration",
        },
      });

      return { member, transaction };
    });

    return NextResponse.json({ member: result.member }, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { sql, generateSystemReference } from "@/lib/db";

// // GET all members
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");

//     let members;

//     if (status && ["pending", "approved", "rejected"].includes(status)) {
//       members = await sql`
//         SELECT
//           id, "firstName", "middleName", surname, gender,
//           "currentAddress", city, country, "admissionNumber",
//           "dateOfEntry", "dateOfExit",
//           email, phone, "registrationAmount", "transactionReference",
//           "systemReference", status, "createdAt", "updatedAt"
//         FROM "Member"
//         WHERE status = ${status}
//         ORDER BY "createdAt" DESC
//       `;
//     } else {
//       members = await sql`
//         SELECT
//           id, "firstName", "middleName", surname, gender,
//           "currentAddress", city, country, "admissionNumber",
//           "dateOfEntry", "dateOfExit",
//           email, phone, "registrationAmount", "transactionReference",
//           "systemReference", status, "createdAt", "updatedAt"
//         FROM "Member"
//         ORDER BY "createdAt" DESC
//       `;
//     }

//     return NextResponse.json({ members });
//   } catch (error) {
//     console.error("Error fetching members:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch members" },
//       { status: 500 },
//     );
//   }
// }

// // POST create a new member
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const {
//       firstName,
//       middleName,
//       surname,
//       gender,
//       currentAddress,
//       city,
//       country,
//       admissionNumber,
//       dateOfEntry,
//       dateOfExit,
//       email,
//       phone,
//       registrationAmount,
//       transactionReference,
//     } = body;

//     // Validate required fields
//     if (
//       !firstName ||
//       !surname ||
//       !gender ||
//       !currentAddress ||
//       !city ||
//       !dateOfEntry ||
//       !dateOfExit ||
//       !phone ||
//       !transactionReference
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     const systemReference = generateSystemReference();
//     const id = crypto.randomUUID();
//     const now = new Date().toISOString();

//     // Insert member with city and country
//     await sql`
//       INSERT INTO "Member" (
//         id, "firstName", "middleName", surname, gender, "currentAddress",
//         city, country, "admissionNumber", "dateOfEntry", "dateOfExit",
//         email, phone, "registrationAmount", "transactionReference",
//         "systemReference", status, "createdAt", "updatedAt"
//       ) VALUES (
//         ${id}, ${firstName}, ${middleName || null}, ${surname}, ${gender},
//         ${currentAddress}, ${city}, ${country || "Sierra Leone"},
//         ${admissionNumber || null}, ${dateOfEntry}, ${dateOfExit},
//         ${email || null}, ${phone}, ${registrationAmount || 0},
//         ${transactionReference}, ${systemReference}, 'pending', ${now}, ${now}
//       )
//     `;

//     // Also create a transaction record
//     const transactionId = crypto.randomUUID();
//     const memberName = `${firstName} ${middleName || ""} ${surname}`
//       .trim()
//       .replace(/\s+/g, " ");

//     await sql`
//       INSERT INTO "Transaction" (
//         id, "memberId", "memberName", phone, amount,
//         "transactionReference", "systemReference", type, "createdAt"
//       ) VALUES (
//         ${transactionId}, ${id}, ${memberName}, ${phone},
//         ${registrationAmount || 0}, ${transactionReference}, ${systemReference},
//         'registration', ${now}
//       )
//     `;

//     // Return the created member
//     const [member] = await sql`
//       SELECT * FROM "Member" WHERE id = ${id}
//     `;

//     return NextResponse.json({ member }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating member:", error);
//     return NextResponse.json(
//       { error: "Failed to create member" },
//       { status: 500 },
//     );
//   }
// }
