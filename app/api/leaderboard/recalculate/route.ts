import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { searchParams } = req.nextUrl;
    const mode = searchParams.get('mode') || 'reset';

    if (mode === 'recalculate') {
      // Recalculate each active user's total points from PointsLedger
      const activeUsers = await prisma.user.findMany({
        where: { isDeleted: false },
        select: { id: true, communityPoints: true },
      });

      for (const user of activeUsers) {
        const aggregate = await prisma.pointsLedger.aggregate({
          where: { userId: user.id },
          _sum: { points: true },
        });

        const totalPointsFromLedger = aggregate._sum.points ?? 0;
        // Maintain whichever is higher or use ledger total
        const newPoints = Math.max(user.communityPoints, totalPointsFromLedger);

        await prisma.user.update({
          where: { id: user.id },
          data: { communityPoints: newPoints },
        });
      }

      // Re-rank all active users by communityPoints
      const rankedUsers = await prisma.user.findMany({
        where: { isDeleted: false, status: 'active' },
        select: { id: true },
        orderBy: { communityPoints: 'desc' },
      });

      for (let rank = 0; rank < rankedUsers.length; rank++) {
        await prisma.user.update({
          where: { id: rankedUsers[rank].id },
          data: { currentRank: rank + 1 },
        });
      }

      broadcastEvent('leaderboard_updated', { action: 'recalculate', timestamp: new Date().toISOString() });

      return ok({
        message: 'Community Leaderboard student rankings have been recalculated from point transaction history!',
      });
    }

    // Reset all student community points to 0 and currentRank to default 9999
    await prisma.user.updateMany({
      where: { isDeleted: false },
      data: {
        communityPoints: 0,
        currentRank: 9999,
      },
    });

    // Clear ledger entries for clean reset
    await prisma.pointsLedger.deleteMany({});

    // Broadcast real-time update to all connected clients & leaderboard pages
    broadcastEvent('leaderboard_updated', { action: 'reset', timestamp: new Date().toISOString() });

    return ok({
      message: 'Community Leaderboard student points and rankings have been completely reset to 0!',
    });
  } catch (e) {
    console.error('[POST /api/leaderboard/recalculate]', e);
    return ERR.INTERNAL();
  }
}
