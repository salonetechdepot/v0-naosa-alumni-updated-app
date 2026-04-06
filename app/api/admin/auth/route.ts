import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    // Create session token (simple approach - in production use JWT or proper sessions)
    const sessionToken = Buffer.from(
      JSON.stringify({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    ).toString("base64")

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

// DELETE - Admin logout
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}

// GET - Check auth status
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      const session = JSON.parse(
        Buffer.from(sessionToken.value, "base64").toString()
      )

      // Check if session is expired
      if (session.exp < Date.now()) {
        cookieStore.delete("admin_session")
        return NextResponse.json(
          { authenticated: false, error: "Session expired" },
          { status: 401 }
        )
      }

      // Fetch fresh admin data
      const admin = await prisma.adminUser.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      })

      if (!admin || !admin.isActive) {
        cookieStore.delete("admin_session")
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }

      return NextResponse.json({
        authenticated: true,
        admin,
      })
    } catch {
      cookieStore.delete("admin_session")
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Error checking auth:", error)
    return NextResponse.json(
      { error: "Auth check failed" },
      { status: 500 }
    )
  }
}
