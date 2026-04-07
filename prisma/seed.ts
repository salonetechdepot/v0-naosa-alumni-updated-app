// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const supportPassword = await bcrypt.hash("Support123!", 10);

  // Create Admin Users
  const admins = [
    {
      email: "admin@naosa.org",
      password: adminPassword,
      name: "Super Admin",
      role: "admin" as const,
      isActive: true,
    },
    {
      email: "support@naosa.org",
      password: supportPassword,
      name: "Support Team",
      role: "support" as const,
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

  // Optional: Create a test member with user role
  const testMemberPassword = await bcrypt.hash("Member123!", 10);
  const testMember = await prisma.user.upsert({
    where: { email: "member@naosa.org" },
    update: {},
    create: {
      email: "member@naosa.org",
      password: testMemberPassword,
      name: "Test Member",
      role: "user",
      isActive: true,
    },
  });
  console.log(
    `✅ Created test member user: ${testMember.email} (${testMember.role})`,
  );

  console.log("🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("Admin: admin@naosa.org / Admin123!");
  console.log("Support: support@naosa.org / Support123!");
  console.log("Test Member: member@naosa.org / Member123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
