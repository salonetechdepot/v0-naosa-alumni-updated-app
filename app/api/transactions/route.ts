import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET all transactions
export async function GET() {
  try {
    const transactions = await sql`
      SELECT 
        id, "memberId", "memberName", phone, amount,
        "transactionReference", "systemReference", "createdAt"
      FROM "Transaction"
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST create a new transaction (usually done automatically with member registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId,
      memberName,
      phone,
      amount,
      transactionReference,
      systemReference,
    } = body

    // Validate required fields
    if (!memberId || !memberName || !phone || !transactionReference || !systemReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO "Transaction" (
        id, "memberId", "memberName", phone, amount,
        "transactionReference", "systemReference", "createdAt"
      ) VALUES (
        ${id}, ${memberId}, ${memberName}, ${phone},
        ${amount || 0}, ${transactionReference}, ${systemReference}, ${now}
      )
    `

    const [transaction] = await sql`
      SELECT * FROM "Transaction" WHERE id = ${id}
    `

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
