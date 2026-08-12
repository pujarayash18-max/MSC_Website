import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    const winners = await prisma.winnerShowcase.findMany({
      where: {
        isDeleted: false,
        published: true,
        ...(eventId ? { eventId } : {}),
      },
      include: {
        event: { select: { id: true, title: true, startDate: true, category: true } },
        user: { select: { fullName: true, studentId: true, profilePhoto: true } },
      },
      orderBy: [{ event: { startDate: 'desc' } }, { rank: 'asc' }],
    });

    return ok({ winners });
  } catch (e) {
    console.error('[GET /api/winners]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { eventId, winners } = body;
    // winners = [{ userId, rank: 'FIRST' | 'SECOND' | 'THIRD', points: 100 }]

    if (!eventId || !Array.isArray(winners)) {
      return err('eventId and winners array are required.', 400);
    }

    const createdWinners = [];
    for (const w of winners) {
      if (!w.userId || !w.rank) continue;

      const student = await prisma.user.findUnique({ where: { id: w.userId } });
      if (!student) continue;

      let reg = await prisma.registration.findFirst({
        where: { userId: w.userId, eventId, isDeleted: false },
      });

      if (!reg) {
        // Find default form or fallback
        const form = await prisma.registrationForm.findFirst({ where: { eventId, isDeleted: false } });
        reg = await prisma.registration.create({
          data: {
            userId: w.userId,
            eventId,
            formId: form?.id || 'clx_default_form_001',
            formType: 'DEFAULT',
            responses: {},
            registrationStatus: 'APPROVED',
            qrToken: `WIN_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          },
        });
      }

      const points = w.points || (w.rank === 'FIRST' ? 100 : w.rank === 'SECOND' ? 75 : 50);
      const winnerRec = await prisma.winnerShowcase.create({
        data: {
          eventId,
          userId: w.userId,
          registrationId: reg.id,
          studentName: student.fullName,
          college: student.college || 'Marwadi University',
          rank: w.rank,
          points,
          badge: w.rank === 'FIRST' ? 'Gold Medalist' : w.rank === 'SECOND' ? 'Silver Runner Up' : 'Bronze Winner',
          published: true,
        },
      });

      await prisma.user.update({
        where: { id: w.userId },
        data: { communityPoints: { increment: points } },
      });

      await prisma.pointsLedger.create({
        data: {
          userId: w.userId,
          points,
          reason: `Winner Award: ${w.rank} Place`,
          eventId,
          awardedBy: session.userId,
        },
      });

      createdWinners.push(winnerRec);
    }

    broadcastEvent('winner_published', { eventId, winnersCount: createdWinners.length });
    return ok({ winners: createdWinners }, 201);
  } catch (e) {
    console.error('[POST /api/winners]', e);
    return ERR.INTERNAL();
  }
}
