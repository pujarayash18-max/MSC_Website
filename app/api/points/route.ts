import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Leaderboard (public) + user's own points history (auth)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const mode = searchParams.get('mode') || 'leaderboard'; // leaderboard | history
    const limit = parseInt(searchParams.get('limit') || '50');

    if (mode === 'leaderboard') {
      const users = await prisma.user.findMany({
        where: { isDeleted: false, status: 'active' },
        select: {
          id: true,
          fullName: true,
          studentId: true,
          profilePhoto: true,
          communityPoints: true,
          currentRank: true,
          college: true,
          department: true,
          year: true,
          roleName: true,
          _count: { select: { achievements: true, certificates: true } },
        },
        orderBy: { communityPoints: 'desc' },
        take: limit,
      });

      // Assign rank positions
      const leaderboard = users.map((u, i) => ({ ...u, position: i + 1 }));
      return ok({ leaderboard });
    }

    // Personal points history
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const ledger = await prisma.pointsLedger.findMany({
      where: { userId: session.userId },
      orderBy: { awardedAt: 'desc' },
    });

    return ok({ ledger });
  } catch (e) {
    console.error('[GET /api/points]', e);
    return ERR.INTERNAL();
  }
}
