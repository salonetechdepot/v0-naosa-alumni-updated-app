import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const memberId = searchParams.get("memberId")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (memberId) {
      where.memberId = memberId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

// POST create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId,
      type,
      amount,
      description,
      paymentMethod,
      referenceNumber,
      notes,
    } = body

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Generate transaction ID
    const transactionCount = await prisma.transaction.count()
    const transactionId = `TXN-${String(transactionCount + 1).padStart(6, "0")}`

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,
        memberId,
        type,
        amount,
        description,
        paymentMethod,
        referenceNumber,
        notes,
        status: "pending",
      },
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
