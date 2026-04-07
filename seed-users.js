const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { email: 'admin@naosa.org', name: 'Admin User', role: 'admin', password: hashedPassword },
    { email: 'member@naosa.org', name: 'Member User', role: 'member', password: hashedPassword },
    { email: 'user@naosa.org', name: 'Regular User', role: 'user', password: hashedPassword },
    { email: 'volunteer@naosa.org', name: 'Volunteer', role: 'volunteer', password: hashedPassword },
    { email: 'support@naosa.org', name: 'Support Staff', role: 'support', password: hashedPassword },
    { email: 'donor@naosa.org', name: 'Donor', role: 'donor', password: hashedPassword },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ Created ${user.role}: ${user.email}`);
  }
  
  console.log('\n📝 Login credentials (password: password123 for all)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
