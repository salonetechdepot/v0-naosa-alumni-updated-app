import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
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

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
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

    // If transaction is completed and it's a membership fee, update member status
    if (body.status === "completed" && transaction.type === "membership_fee") {
      await prisma.member.update({
        where: { id: transaction.memberId },
        data: {
          status: "active",
          membershipStartDate: new Date(),
          membershipEndDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
        },
      })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    )
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    )
  }
}
