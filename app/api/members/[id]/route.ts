import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET a single member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [member] = await sql`
      SELECT 
        id, "firstName", "middleName", surname, gender, 
        "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
        email, phone, "registrationAmount", "transactionReference", 
        "systemReference", status, "createdAt", "updatedAt"
      FROM "Member"
      WHERE id = ${id}
    `

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PATCH update a member's status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Check if member exists
    const [existingMember] = await sql`
      SELECT id FROM "Member" WHERE id = ${id}
    `

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    // Update the member
    await sql`
      UPDATE "Member"
      SET status = ${status}, "updatedAt" = ${now}
      WHERE id = ${id}
    `

    // Get the updated member
    const [member] = await sql`
      SELECT 
        id, "firstName", "middleName", surname, gender, 
        "currentAddress", "admissionNumber", "dateOfEntry", "dateOfExit",
        email, phone, "registrationAmount", "transactionReference", 
        "systemReference", status, "createdAt", "updatedAt"
      FROM "Member"
      WHERE id = ${id}
    `

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE a member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if member exists
    const [existingMember] = await sql`
      SELECT id FROM "Member" WHERE id = ${id}
    `

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Delete associated transactions first
    await sql`
      DELETE FROM "Transaction" WHERE "memberId" = ${id}
    `

    // Delete the member
    await sql`
      DELETE FROM "Member" WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
