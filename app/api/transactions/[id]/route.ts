import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET a single transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [transaction] = await sql`
      SELECT 
        id, "memberId", "memberName", phone, amount,
        "transactionReference", "systemReference", "createdAt"
      FROM "Transaction"
      WHERE id = ${id}
    `

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// DELETE a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [existingTransaction] = await sql`
      SELECT id FROM "Transaction" WHERE id = ${id}
    `

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    await sql`
      DELETE FROM "Transaction" WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
