import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all members or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const membershipType = searchParams.get("membershipType")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (membershipType) {
      where.membershipType = membershipType
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { memberId: { contains: search, mode: "insensitive" } },
      ]
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        transactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

// POST create new member
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

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "A member with this email already exists" },
        { status: 400 }
      )
    }

    // Generate member ID
    const memberCount = await prisma.member.count()
    const memberId = `NAOSA-${String(memberCount + 1).padStart(5, "0")}`

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

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
