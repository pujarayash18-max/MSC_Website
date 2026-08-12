import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    if (!eventId || !Array.isArray(winners) || winners.length === 0) {
      return err('eventId and winners array are required.', 400);
    }

    // Resolve target event
    let event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      event = await prisma.event.findFirst({
        where: { isDeleted: false },
        orderBy: { startDate: 'desc' },
      });
    }
    if (!event) {
      return err('No active event found in database.', 404);
    }

    // Read configured point values from global settings
    const globalSettings = await prisma.settings.findUnique({ where: { id: 'global' } });
    const dp = (globalSettings?.defaultPoints as any) || {};
    const pointMap: Record<string, number> = {
      FIRST: Number(dp.firstPlace) || 100,
      SECOND: Number(dp.secondPlace) || 80,
      THIRD: Number(dp.thirdPlace) || 50,
      PARTICIPANT: Number(dp.participant) || 20,
    };

    // ── Step 1: Wipe ALL old showcases & ledger for THIS event ──
    await prisma.winnerShowcase.deleteMany({ where: { eventId: event.id } });
    await prisma.pointsLedger.deleteMany({ where: { eventId: event.id } });

    // ── Step 2: Create fresh winner records ──
    const createdWinners = [];

    for (const w of winners) {
      if (!w.userId || !w.rank) continue;

      // --- Resolve student: by cuid first, then by name/enrollment text ---
      let student = await prisma.user.findUnique({ where: { id: w.userId } });

      if (!student) {
        const raw = String(w.userId).trim();
        const name = raw.split('(')[0].trim();
        const idInParens = raw.match(/\(([^)]+)\)/)?.[1] || raw;

        student = await prisma.user.findFirst({
          where: {
            OR: [
              { fullName: { contains: name, mode: 'insensitive' } },
              { enrollmentNumber: { contains: idInParens, mode: 'insensitive' } },
              { studentId: { contains: idInParens, mode: 'insensitive' } },
            ],
          },
        });
      }
      if (!student) continue;

      // --- Ensure a RegistrationForm exists for this event ---
      let form = await prisma.registrationForm.findFirst({
        where: { eventId: event.id, isDeleted: false },
      });
      if (!form) {
        form = await prisma.registrationForm.create({
          data: {
            eventId: event.id,
            formName: `${event.title} Registration`,
            formType: 'COLLEGE_REGISTRATION',
            isEnabled: true,
          },
        });
      }

      // --- Ensure a Registration record exists ---
      let reg = await prisma.registration.findFirst({
        where: { userId: student.id, eventId: event.id, isDeleted: false },
      });
      if (!reg) {
        reg = await prisma.registration.create({
          data: {
            userId: student.id,
            eventId: event.id,
            formId: form.id,
            formType: form.formType,
            responses: {},
            registrationStatus: 'APPROVED',
            qrToken: `WIN_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          },
        });
      }

      const points = pointMap[w.rank] ?? pointMap.PARTICIPANT;

      // Create winner showcase record
      const winnerRec = await prisma.winnerShowcase.create({
        data: {
          eventId: event.id,
          userId: student.id,
          registrationId: reg.id,
          studentName: student.fullName,
          college: student.college || 'Marwadi University',
          rank: w.rank as any,
          points,
          badge:
            w.rank === 'FIRST' ? 'Gold Medalist'
            : w.rank === 'SECOND' ? 'Silver Runner Up'
            : 'Bronze Winner',
          published: true,
        },
      });

      // Ledger entry
      await prisma.pointsLedger.create({
        data: {
          userId: student.id,
          points,
          reason: `Winner: ${w.rank} (+${points} pts) — ${event.title}`,
          eventId: event.id,
          awardedBy: session.userId,
        },
      });

      createdWinners.push(winnerRec);
    }

    // ── Step 3: Recalculate communityPoints for EVERY user ──
    //    SUM of all their WinnerShowcase.points across ALL events
    const allUsers = await prisma.user.findMany({ where: { isDeleted: false } });
    for (const u of allUsers) {
      const agg = await prisma.winnerShowcase.aggregate({
        where: { userId: u.id, isDeleted: false },
        _sum: { points: true },
      });
      await prisma.user.update({
        where: { id: u.id },
        data: { communityPoints: agg._sum.points || 0 },
      });
    }

    // ── Step 4: Recalculate ranks ──
    const ranked = await prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { communityPoints: 'desc' },
    });
    for (let i = 0; i < ranked.length; i++) {
      await prisma.user.update({
        where: { id: ranked[i].id },
        data: { currentRank: i + 1 },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Published Winner Cascade — ${event.title}`,
        module: 'EVENTS',
        status: 'SUCCESS',
        details: `${createdWinners.length} winners: ${pointMap.FIRST}/${pointMap.SECOND}/${pointMap.THIRD} pts`,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        browser: req.headers.get('user-agent') || 'Browser',
      },
    }).catch(() => {});

    broadcastEvent('winner_published', { eventId: event.id, winnersCount: createdWinners.length });
    broadcastEvent('leaderboard_updated', { eventId: event.id, winnersCount: createdWinners.length });

    return ok(
      {
        winners: createdWinners,
        message: `Published ${createdWinners.length} winners. Points: 1st=${pointMap.FIRST}, 2nd=${pointMap.SECOND}, 3rd=${pointMap.THIRD}.`,
      },
      201
    );
  } catch (e: any) {
    console.error('[POST /api/winners]', e);
    return err(e?.message || 'Failed to execute winner cascade.', 500);
  }
}
