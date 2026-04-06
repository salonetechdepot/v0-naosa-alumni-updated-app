import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET all transactions with optional type filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let transactions
    if (type && ['registration', 'donation', 'contribution'].includes(type)) {
      transactions = await sql`
        SELECT 
          id, "memberId", "memberName", phone, amount,
          "transactionReference", "systemReference", type, description, "createdAt"
        FROM "Transaction"
        WHERE type = ${type}
        ORDER BY "createdAt" DESC
      `
    } else {
      transactions = await sql`
        SELECT 
          id, "memberId", "memberName", phone, amount,
          "transactionReference", "systemReference", type, description, "createdAt"
        FROM "Transaction"
        ORDER BY "createdAt" DESC
      `
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST create a new transaction
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
      type = 'registration',
      description,
    } = body

    // Validate required fields
    if (!memberName || !phone || !transactionReference || !systemReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate transaction type
    if (!['registration', 'donation', 'contribution'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be registration, donation, or contribution' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await sql`
      INSERT INTO "Transaction" (
        id, "memberId", "memberName", phone, amount,
        "transactionReference", "systemReference", type, description, "createdAt"
      ) VALUES (
        ${id}, ${memberId || null}, ${memberName}, ${phone},
        ${amount || 0}, ${transactionReference}, ${systemReference}, 
        ${type}, ${description || null}, ${now}
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
