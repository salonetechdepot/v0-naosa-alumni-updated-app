import { NextRequest, NextResponse } from 'next/server'
import { sql, generateSystemReference } from '@/lib/db'

// Public registration endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      firstName,
      middleName,
      surname,
      gender,
      currentAddress,
      admissionNumber,
      dateOfEntry,
      dateOfExit,
      email,
      phone,
      registrationAmount,
      transactionReference,
    } = body

    // Validate required fields
    if (!firstName || !surname || !gender || !currentAddress || !dateOfEntry || !dateOfExit || !phone || !transactionReference) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required fields.' },
        { status: 400 }
      )
    }

    // Validate gender
    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      )
    }

    // Check for duplicate transaction reference
    const existingTransaction = await sql`
      SELECT id FROM "Transaction" WHERE "transactionReference" = ${transactionReference}
    `

    if (existingTransaction.length > 0) {
      return NextResponse.json(
        { error: 'This transaction reference has already been used. Please provide a unique transaction reference.' },
        { status: 400 }
      )
    }

    const systemReference = generateSystemReference()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    // Insert member
    await sql`
      INSERT INTO "Member" (
        id, "firstName", "middleName", surname, gender, "currentAddress",
        "admissionNumber", "dateOfEntry", "dateOfExit", email, phone,
        "registrationAmount", "transactionReference", "systemReference",
        status, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${firstName}, ${middleName || null}, ${surname}, ${gender},
        ${currentAddress}, ${admissionNumber || null}, ${dateOfEntry}, ${dateOfExit},
        ${email || null}, ${phone}, ${registrationAmount || 0}, ${transactionReference},
        ${systemReference}, 'pending', ${now}, ${now}
      )
    `

    // Create transaction record
    const transactionId = crypto.randomUUID()
    const memberName = `${firstName} ${middleName || ''} ${surname}`.trim().replace(/\s+/g, ' ')

    await sql`
      INSERT INTO "Transaction" (
        id, "memberId", "memberName", phone, amount,
        "transactionReference", "systemReference", "createdAt"
      ) VALUES (
        ${transactionId}, ${id}, ${memberName}, ${phone},
        ${registrationAmount || 0}, ${transactionReference}, ${systemReference}, ${now}
      )
    `

    // Get the created member
    const [member] = await sql`
      SELECT 
        id, "firstName", "middleName", surname, gender, 
        "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
        email, phone, "registrationAmount", "transactionReference", 
        "systemReference", status, "createdAt", "updatedAt"
      FROM "Member"
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
      member,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    )
  }
}
