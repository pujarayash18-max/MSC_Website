import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Find Yash Pujara by name or enrollment
    const yash = await prisma.user.findFirst({
      where: {
        OR: [
          { fullName: { contains: 'Yash', mode: 'insensitive' } },
          { enrollmentNumber: '92400103516' },
        ],
      },
    });

    if (yash) {
      // Award Yash 150 points and set rank 1
      await prisma.user.update({
        where: { id: yash.id },
        data: {
          communityPoints: 150,
          currentRank: 1,
        },
      });

      // Clear extraneous points from seed accounts if needed
      await prisma.user.updateMany({
        where: {
          id: { not: yash.id },
        },
        data: {
          communityPoints: 50,
        },
      });

      // Re-assign ranks based on communityPoints desc
      const sortedUsers = await prisma.user.findMany({
        orderBy: { communityPoints: 'desc' },
      });

      for (let i = 0; i < sortedUsers.length; i++) {
        await prisma.user.update({
          where: { id: sortedUsers[i].id },
          data: { currentRank: i + 1 },
        });
      }
    }

    return ok({ message: 'Database points corrected live. Yash Pujara set to 150 points & #1 rank.' });
  } catch (e) {
    console.error('[GET /api/admin/fix-points]', e);
    return ERR.INTERNAL();
  }
}
