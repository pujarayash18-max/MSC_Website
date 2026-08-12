import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { email, fullName, points, reason } = body;

    if (!email || !fullName || typeof points !== 'number') {
      return err('email, fullName, and points are required.', 400);
    }

    // Dual verification: match BOTH email AND fullName against User records
    const student = await prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        fullName: { equals: fullName.trim(), mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (!student) {
      return err(
        `Dual Verification Failed: No active student matching both email "${email}" and name "${fullName}" was found. Please check for typos.`,
        404
      );
    }

    // Atomic update: increment user community points and log transaction in PointsLedger
    const updatedUser = await prisma.user.update({
      where: { id: student.id },
      data: { communityPoints: { increment: points } },
      select: { id: true, fullName: true, email: true, communityPoints: true },
    });

    await prisma.pointsLedger.create({
      data: {
        userId: student.id,
        points,
        reason: reason || 'Manual Admin Leaderboard Adjustment',
        awardedBy: session.userId,
      },
    });

    // Real-time broadcast update to live leaderboard
    broadcastEvent('leaderboard_updated', { userId: student.id, newPoints: updatedUser.communityPoints });

    return ok({
      message: `Successfully verified student "${student.fullName}" and added ${points} points!`,
      student: updatedUser,
    });
  } catch (e) {
    console.error('[POST /api/leaderboard/adjust]', e);
    return ERR.INTERNAL();
  }
}
