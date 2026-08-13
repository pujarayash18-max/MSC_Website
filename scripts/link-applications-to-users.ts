import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkApplications() {
  console.log('🔗 Linking existing recruitment applications to user accounts...');

  const applications = await prisma.recruitmentApplication.findMany({
    where: { isDeleted: false },
  });

  let updatedCount = 0;
  for (const app of applications) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: app.email.trim(), mode: 'insensitive' } },
          { enrollmentNumber: { equals: app.enrollment.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (user && app.userId !== user.id) {
      await prisma.recruitmentApplication.update({
        where: { id: app.id },
        data: { userId: user.id },
      });
      updatedCount++;
      console.log(`  ✓ Linked application ${app.id} (${app.fullName} - ${app.roleTitle}) to User ${user.email}`);
    }
  }

  console.log(`✅ Successfully linked ${updatedCount} applications to user accounts.`);
}

linkApplications()
  .catch((e) => {
    console.error('❌ Error linking applications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
