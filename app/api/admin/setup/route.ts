import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST - Create initial admin user (only works if no admins exist)
export async function POST(request: NextRequest) {
  try {
    // Check if any admin exists
    const existingAdmins = await sql`
      SELECT id FROM "AdminUser" LIMIT 1
    `

    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. Use the admin panel to create additional users.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    // Create admin user
    await sql`
      INSERT INTO "AdminUser" (id, email, password, name, "createdAt")
      VALUES (${id}, ${email}, ${passwordHash}, ${name || 'Admin'}, ${now})
    `

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id,
        email,
        name: name || 'Admin',
      },
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}

// GET - Check if setup is needed
export async function GET() {
  try {
    const existingAdmins = await sql`
      SELECT id FROM "AdminUser" LIMIT 1
    `

    return NextResponse.json({
      setupRequired: existingAdmins.length === 0,
    })
  } catch (error) {
    console.error('Error checking setup status:', error)
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    )
  }
}
