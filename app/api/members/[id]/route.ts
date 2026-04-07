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

// import { NextRequest, NextResponse } from 'next/server'
// import { sql } from '@/lib/db'

// // GET a single member by ID
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params

//     const [member] = await sql`
//       SELECT
//         id, "firstName", "middleName", surname, gender,
//         "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
//         email, phone, "registrationAmount", "transactionReference",
//         "systemReference", status, "createdAt", "updatedAt"
//       FROM "Member"
//       WHERE id = ${id}
//     `

//     if (!member) {
//       return NextResponse.json(
//         { error: 'Member not found' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json({ member })
//   } catch (error) {
//     console.error('Error fetching member:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch member' },
//       { status: 500 }
//     )
//   }
// }

// // PATCH update a member's status
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params
//     const body = await request.json()
//     const { status } = body

//     if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
//       return NextResponse.json(
//         { error: 'Invalid status value' },
//         { status: 400 }
//       )
//     }

//     // Check if member exists
//     const [existingMember] = await sql`
//       SELECT id FROM "Member" WHERE id = ${id}
//     `

//     if (!existingMember) {
//       return NextResponse.json(
//         { error: 'Member not found' },
//         { status: 404 }
//       )
//     }

//     const now = new Date().toISOString()

//     // Update the member
//     await sql`
//       UPDATE "Member"
//       SET status = ${status}, "updatedAt" = ${now}
//       WHERE id = ${id}
//     `

//     // Get the updated member
//     const [member] = await sql`
//       SELECT
//         id, "firstName", "middleName", surname, gender,
//         "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
//         email, phone, "registrationAmount", "transactionReference",
//         "systemReference", status, "createdAt", "updatedAt"
//       FROM "Member"
//       WHERE id = ${id}
//     `

//     return NextResponse.json({ member })
//   } catch (error) {
//     console.error('Error updating member:', error)
//     return NextResponse.json(
//       { error: 'Failed to update member' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE a member
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params

//     // Check if member exists
//     const [existingMember] = await sql`
//       SELECT id FROM "Member" WHERE id = ${id}
//     `

//     if (!existingMember) {
//       return NextResponse.json(
//         { error: 'Member not found' },
//         { status: 404 }
//       )
//     }

//     // Delete associated transactions first
//     await sql`
//       DELETE FROM "Transaction" WHERE "memberId" = ${id}
//     `

//     // Delete the member
//     await sql`
//       DELETE FROM "Member" WHERE id = ${id}
//     `

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Error deleting member:', error)
//     return NextResponse.json(
//       { error: 'Failed to delete member' },
//       { status: 500 }
//     )
//   }
// }
