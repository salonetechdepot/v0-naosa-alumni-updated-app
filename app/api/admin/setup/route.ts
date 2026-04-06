import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST - Create initial admin user (only works if no admins exist)
export async function POST(request: NextRequest) {
  try {
    // Check if any admin exists
    const existingAdmin = await prisma.adminUser.findFirst()

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin user already exists. Use the admin panel to create additional users." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || "Admin",
        lastName: lastName || "User",
        role: "super_admin",
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    )
  }
}

// GET - Check if setup is needed
export async function GET() {
  try {
    const existingAdmin = await prisma.adminUser.findFirst()

    return NextResponse.json({
      setupRequired: !existingAdmin,
    })
  } catch (error) {
    console.error("Error checking setup status:", error)
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    )
  }
}
