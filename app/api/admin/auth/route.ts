import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Simple session token generation
function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

// In-memory session store (in production, use a database or Redis)
const sessions = new Map<string, { adminId: string; email: string; expiresAt: Date }>()

// GET - Check if admin is authenticated
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No session' },
        { status: 401 }
      )
    }

    const session = sessions.get(sessionToken)

    if (!session || session.expiresAt < new Date()) {
      sessions.delete(sessionToken)
      return NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        email: session.email,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    )
  }
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find admin by email
    const [admin] = await sql`
      SELECT id, email, password, name
      FROM "AdminUser"
      WHERE email = ${email}
    `

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    sessions.set(sessionToken, {
      adminId: admin.id,
      email: admin.email,
      expiresAt,
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      sessions.delete(sessionToken)
    }

    cookieStore.delete(SESSION_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
