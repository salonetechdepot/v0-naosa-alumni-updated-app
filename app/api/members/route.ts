import { NextRequest, NextResponse } from 'next/server'
import { sql, generateSystemReference } from '@/lib/db'

// GET all members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let members
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      members = await sql`
        SELECT 
          id, "firstName", "middleName", surname, gender, 
          "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
          email, phone, "registrationAmount", "transactionReference", 
          "systemReference", status, "createdAt", "updatedAt"
        FROM "Member"
        WHERE status = ${status}
        ORDER BY "createdAt" DESC
      `
    } else {
      members = await sql`
        SELECT 
          id, "firstName", "middleName", surname, gender, 
          "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
          email, phone, "registrationAmount", "transactionReference", 
          "systemReference", status, "createdAt", "updatedAt"
        FROM "Member"
        ORDER BY "createdAt" DESC
      `
    }

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST create a new member
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
        { error: 'Missing required fields' },
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

    // Also create a transaction record
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

    // Return the created member
    const [member] = await sql`
      SELECT * FROM "Member" WHERE id = ${id}
    `

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}
