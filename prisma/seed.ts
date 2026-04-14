import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // Hash passwords
  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 10);
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const supportPassword = await bcrypt.hash("Support123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  // Create Super Admin User
  const superAdminEmail = "superadmin@naosa.org";
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: superAdminPassword,
        name: "Super Admin",
        role: "super_admin" as const,
        isActive: true,
      },
    });
    console.log(
      `✅ Created super admin user: ${superAdmin.email} (${superAdmin.role})`,
    );
  } else {
    console.log(`⚠️  Super admin already exists: ${superAdminEmail}`);
  }

  // Create Admin Users
  const admins = [
    {
      email: "admin@naosa.org",
      password: adminPassword,
      name: "Admin User",
      role: "admin" as const,
      isActive: true,
    },
    {
      email: "admin2@naosa.org",
      password: adminPassword,
      name: "Second Admin",
      role: "admin" as const,
      isActive: true,
    },
  ];

  for (const adminData of admins) {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: adminData,
      });
      console.log(`✅ Created admin user: ${user.email} (${user.role})`);
    } else {
      console.log(`⚠️  User already exists: ${adminData.email}`);
    }
  }

  // Create Support Users
  const supportUsers = [
    {
      email: "support@naosa.org",
      password: supportPassword,
      name: "Support Team",
      role: "support" as const,
      isActive: true,
    },
    {
      email: "helpdesk@naosa.org",
      password: supportPassword,
      name: "Help Desk",
      role: "support" as const,
      isActive: true,
    },
  ];

  for (const supportData of supportUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: supportData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: supportData,
      });
      console.log(`✅ Created support user: ${user.email} (${user.role})`);
    } else {
      console.log(`⚠️  User already exists: ${supportData.email}`);
    }
  }

  // Create Regular Users
  const regularUsers = [
    {
      email: "user@naosa.org",
      password: userPassword,
      name: "Regular User",
      role: "user" as const,
      isActive: true,
    },
    {
      email: "member@naosa.org",
      password: userPassword,
      name: "Test Member",
      role: "user" as const,
      isActive: true,
    },
  ];

  for (const userData of regularUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created regular user: ${user.email} (${user.role})`);
    } else {
      console.log(`⚠️  User already exists: ${userData.email}`);
    }
  }

  console.log("🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("Super Admin: superadmin@naosa.org / SuperAdmin123!");
  console.log("Admin: admin@naosa.org / Admin123!");
  console.log("Admin2: admin2@naosa.org / Admin123!");
  console.log("Support: support@naosa.org / Support123!");
  console.log("Help Desk: helpdesk@naosa.org / Support123!");
  console.log("Regular User: user@naosa.org / User123!");
  console.log("Test Member: member@naosa.org / User123!");
  console.log("\n⚠️  Note: Only Super Admin can see and manage all users!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
