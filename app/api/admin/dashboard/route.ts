import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET dashboard statistics
export async function GET() {
  try {
    // Get member counts by status
    const [
      totalMembers,
      activeMembers,
      pendingMembers,
      expiredMembers,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "active" } }),
      prisma.member.count({ where: { status: "pending" } }),
      prisma.member.count({ where: { status: "expired" } }),
    ])

    // Get member counts by type
    const membersByType = await prisma.member.groupBy({
      by: ["membershipType"],
      _count: {
        id: true,
      },
    })

    // Get transaction statistics
    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "pending" } }),
      prisma.transaction.count({ where: { status: "completed" } }),
    ])

    // Get total revenue (completed transactions)
    const revenueResult = await prisma.transaction.aggregate({
      where: { status: "completed" },
      _sum: {
        amount: true,
      },
    })

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRegistrations = await prisma.member.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberId: true,
          },
        },
      },
    })

    // Get recent members
    const recentMembers = await prisma.member.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        memberId: true,
        firstName: true,
        lastName: true,
        email: true,
        membershipType: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      members: {
        total: totalMembers,
        active: activeMembers,
        pending: pendingMembers,
        expired: expiredMembers,
        byType: membersByType.reduce(
          (acc, item) => ({
            ...acc,
            [item.membershipType]: item._count.id,
          }),
          {}
        ),
        recentRegistrations,
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        completed: completedTransactions,
        totalRevenue: revenueResult._sum.amount || 0,
      },
      recent: {
        transactions: recentTransactions,
        members: recentMembers,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
