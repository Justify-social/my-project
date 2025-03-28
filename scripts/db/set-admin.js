// scripts/set-admin.js

import PrismaClient from '@prisma/client';
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    // Replace with the email of the user you want to make admin.
    const email = 'admin@example.com';
    
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'admin' },
      create: { email, role: 'admin', hasSeenOnboarding: false },
    });

    console.log('Admin user updated/created:', user);
  } catch (error) {
    console.error('Error setting admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
