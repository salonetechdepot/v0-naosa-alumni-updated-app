import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Public registration endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      membershipType,
      occupation,
      employer,
      emergencyContactName,
      emergencyContactPhone,
      notes,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !membershipType) {
      return NextResponse.json(
        { error: "First name, last name, email, and membership type are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this email already exists. Please contact support if you need assistance." },
        { status: 400 }
      )
    }

    // Generate member ID
    const memberCount = await prisma.member.count()
    const memberId = `NAOSA-${String(memberCount + 1).padStart(5, "0")}`

    // Create the member
    const member = await prisma.member.create({
      data: {
        memberId,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        membershipType,
        occupation,
        employer,
        emergencyContactName,
        emergencyContactPhone,
        notes,
        status: "pending",
      },
    })

    // Create initial membership fee transaction
    const membershipFees: Record<string, number> = {
      regular: 50,
      student: 25,
      senior: 35,
      family: 75,
      lifetime: 500,
    }

    const fee = membershipFees[membershipType] || 50
    const transactionCount = await prisma.transaction.count()
    const transactionId = `TXN-${String(transactionCount + 1).padStart(6, "0")}`

    await prisma.transaction.create({
      data: {
        transactionId,
        memberId: member.id,
        type: "membership_fee",
        amount: fee,
        description: `${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} membership registration fee`,
        status: "pending",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful! You will receive a confirmation email shortly.",
      member: {
        id: member.id,
        memberId: member.memberId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        membershipType: member.membershipType,
        status: member.status,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    )
  }
}
