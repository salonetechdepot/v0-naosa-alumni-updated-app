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

// import { NextResponse } from "next/server";
// import { sql } from "@/lib/db";

// export async function GET() {
//   try {
//     // Get member counts by status
//     const memberCounts = await sql`
//       SELECT
//         COUNT(*) FILTER (WHERE status = 'pending') as pending,
//         COUNT(*) FILTER (WHERE status = 'approved') as approved,
//         COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
//         COUNT(*) as total
//       FROM "Member"
//     `;

//     // Get total amount from transactions with breakdown by type
//     const totalAmountResult = await sql`
//       SELECT COALESCE(SUM(amount), 0) as total
//       FROM "Transaction"
//     `;

//     // Get transaction amounts by type
//     const transactionsByType = await sql`
//       SELECT
//         type,
//         COUNT(*) as count,
//         COALESCE(SUM(amount), 0) as total
//       FROM "Transaction"
//       GROUP BY type
//     `;

//     // Get recent pending members
//     const recentPending = await sql`
//       SELECT id, "firstName", "middleName", surname, phone, "createdAt"
//       FROM "Member"
//       WHERE status = 'pending'
//       ORDER BY "createdAt" DESC
//       LIMIT 5
//     `;

//     const counts = memberCounts[0] || {
//       pending: 0,
//       approved: 0,
//       rejected: 0,
//       total: 0,
//     };
//     const totalAmount = totalAmountResult[0]?.total || 0;

//     // Process transaction breakdown by type
//     const transactionBreakdown = {
//       registration: { count: 0, total: 0 },
//       donation: { count: 0, total: 0 },
//       contribution: { count: 0, total: 0 },
//     };

//     for (const row of transactionsByType) {
//       const type = row.type as keyof typeof transactionBreakdown;
//       if (transactionBreakdown[type]) {
//         transactionBreakdown[type] = {
//           count: parseInt(row.count) || 0,
//           total: parseFloat(row.total) || 0,
//         };
//       }
//     }

//     return NextResponse.json({
//       stats: {
//         total: parseInt(counts.total) || 0,
//         pending: parseInt(counts.pending) || 0,
//         approved: parseInt(counts.approved) || 0,
//         rejected: parseInt(counts.rejected) || 0,
//         totalAmount: parseFloat(totalAmount) || 0,
//         transactionBreakdown,
//       },
//       recentPending,
//     });
//   } catch (error) {
//     console.error("Dashboard error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch dashboard data" },
//       { status: 500 },
//     );
//   }
// }
