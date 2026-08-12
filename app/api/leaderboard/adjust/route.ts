import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
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

    const body = await req.json();
    const { userId, email, fullName, points, reason } = body;

    const numPoints = Number(points);
    if (isNaN(numPoints) || numPoints <= 0) {
      return err('A valid positive number of points is required.', 400);
    }

    let student = null;
    if (userId) {
      student = await prisma.user.findUnique({ where: { id: userId } });
    }

    if (!student && email && fullName) {
      student = await prisma.user.findFirst({
        where: {
          email: { equals: email.trim(), mode: 'insensitive' },
          fullName: { equals: fullName.trim(), mode: 'insensitive' },
          isDeleted: false,
        },
      });
    }

    if (!student && (email || fullName)) {
      student = await prisma.user.findFirst({
        where: {
          isDeleted: false,
          OR: [
            ...(email ? [{ email: { equals: email.trim(), mode: 'insensitive' as const } }] : []),
            ...(fullName ? [{ fullName: { equals: fullName.trim(), mode: 'insensitive' as const } }] : []),
            ...(fullName ? [{ fullName: { contains: fullName.trim(), mode: 'insensitive' as const } }] : []),
          ],
        },
      });
    }

    if (!student) {
      return err(
        `No student matching "${email || fullName || userId}" was found in database.`,
        404
      );
    }

    // Atomic update: increment user community points and log transaction in PointsLedger
    const updatedUser = await prisma.user.update({
      where: { id: student.id },
      data: { communityPoints: { increment: numPoints } },
      select: { id: true, fullName: true, email: true, communityPoints: true },
    });

    await prisma.pointsLedger.create({
      data: {
        userId: student.id,
        points: numPoints,
        reason: reason || 'Manual Admin Leaderboard Adjustment',
        awardedBy: session.userId,
      },
    });

    // Real-time broadcast update to live leaderboard
    broadcastEvent('leaderboard_updated', { userId: student.id, newPoints: updatedUser.communityPoints });

    return ok({
      message: `Successfully awarded ${numPoints} bonus points to "${student.fullName}"! Total points: ${updatedUser.communityPoints} pts.`,
      student: updatedUser,
    });
  } catch (e) {
    console.error('[POST /api/leaderboard/adjust]', e);
    return ERR.INTERNAL();
  }
}
