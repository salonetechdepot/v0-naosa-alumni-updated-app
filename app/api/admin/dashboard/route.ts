import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Get member counts by status
    const memberCounts = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) as total
      FROM "Member"
    `

    // Get total amount from transactions
    const totalAmountResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM "Transaction"
    `

    // Get recent pending members
    const recentPending = await sql`
      SELECT id, "firstName", "middleName", surname, phone, "createdAt"
      FROM "Member"
      WHERE status = 'pending'
      ORDER BY "createdAt" DESC
      LIMIT 5
    `

    const counts = memberCounts[0] || { pending: 0, approved: 0, rejected: 0, total: 0 }
    const totalAmount = totalAmountResult[0]?.total || 0

    return NextResponse.json({
      stats: {
        total: parseInt(counts.total) || 0,
        pending: parseInt(counts.pending) || 0,
        approved: parseInt(counts.approved) || 0,
        rejected: parseInt(counts.rejected) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
      },
      recentPending,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
