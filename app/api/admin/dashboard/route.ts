import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get member counts by status
    const memberCounts = await prisma.member.groupBy({
      by: ["status"],
      _count: true,
    });

    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    };

    memberCounts.forEach((item) => {
      if (item.status === "pending") counts.pending = item._count;
      if (item.status === "approved") counts.approved = item._count;
      if (item.status === "rejected") counts.rejected = item._count;
      counts.total += item._count;
    });

    // Get total amount from transactions
    const totalAmountResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalAmount = totalAmountResult._sum.amount || 0;

    // Get transaction amounts by type
    const transactionsByType = await prisma.transaction.groupBy({
      by: ["type"],
      _count: true,
      _sum: {
        amount: true,
      },
    });

    const transactionBreakdown = {
      registration: { count: 0, total: 0 },
      donation: { count: 0, total: 0 },
      contribution: { count: 0, total: 0 },
    };

    transactionsByType.forEach((item) => {
      const type = item.type as keyof typeof transactionBreakdown;
      if (transactionBreakdown[type]) {
        transactionBreakdown[type] = {
          count: item._count,
          total: item._sum.amount || 0,
        };
      }
    });

    // Get recent pending members
    const recentPending = await prisma.member.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        middleName: true,
        surname: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        total: counts.total,
        pending: counts.pending,
        approved: counts.approved,
        rejected: counts.rejected,
        totalAmount,
        transactionBreakdown,
      },
      recentPending,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
