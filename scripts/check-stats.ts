import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  const members = await prisma.user.count({ where: { isDeleted: false } });
  const events = await prisma.event.count({ where: { isDeleted: false } });
  const speakers = await prisma.speaker.count({ where: { isDeleted: false } });
  const certificates = await prisma.certificate.count({ where: { isDeleted: false } });

  console.log('📊 REAL DATABASE STATS:');
  console.log('Active Student Members:', members);
  console.log('Technical Events Hosted:', events);
  console.log('Industry Speakers Hosted:', speakers);
  console.log('Certificates Issued:', certificates);
}

checkStats().finally(() => prisma.$disconnect());
