import { prisma } from '../lib/prisma';

async function main() {
  console.log('Resetting points to 100, 80, 50...');

  // Set Yash Pujara to 100 points (#1 Rank)
  await prisma.user.updateMany({
    where: {
      OR: [
        { fullName: { contains: 'Yash', mode: 'insensitive' } },
        { email: { contains: 'yash', mode: 'insensitive' } },
        { enrollmentNumber: '92400103516' },
      ],
    },
    data: {
      communityPoints: 100,
      status: 'active',
      isDeleted: false,
    },
  });

  // Set Ananya Verma to 80 points (#2 Rank)
  await prisma.user.updateMany({
    where: {
      fullName: { contains: 'Ananya', mode: 'insensitive' },
    },
    data: {
      communityPoints: 80,
      status: 'active',
      isDeleted: false,
    },
  });

  // Set Dev Mehta to 50 points (#3 Rank)
  await prisma.user.updateMany({
    where: {
      fullName: { contains: 'Dev', mode: 'insensitive' },
    },
    data: {
      communityPoints: 50,
      status: 'active',
      isDeleted: false,
    },
  });

  // Reset other users to 10 points
  await prisma.user.updateMany({
    where: {
      NOT: {
        OR: [
          { fullName: { contains: 'Yash', mode: 'insensitive' } },
          { fullName: { contains: 'Ananya', mode: 'insensitive' } },
          { fullName: { contains: 'Dev', mode: 'insensitive' } },
        ],
      },
    },
    data: {
      communityPoints: 10,
    },
  });

  // Re-rank all active users
  const sortedUsers = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { communityPoints: 'desc' },
  });

  for (let i = 0; i < sortedUsers.length; i++) {
    await prisma.user.update({
      where: { id: sortedUsers[i].id },
      data: { currentRank: i + 1 },
    });
    console.log(`Rank #${i + 1}: ${sortedUsers[i].fullName} (${sortedUsers[i].communityPoints} pts)`);
  }

  console.log('Database points reset to 100, 80, 50 successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
