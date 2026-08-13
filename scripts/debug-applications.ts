import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugApps() {
  const apps = await prisma.recruitmentApplication.findMany();
  console.log('📋 Existing Applications in DB:', JSON.stringify(apps, null, 2));

  const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true } });
  console.log('👥 Users in DB:', JSON.stringify(users, null, 2));
}

debugApps().finally(() => prisma.$disconnect());
