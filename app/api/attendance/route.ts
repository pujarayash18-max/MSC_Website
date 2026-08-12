import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const isAdmin = isAdminRole(session.roleName);

    const attendances = await prisma.attendance.findMany({
      where: {
        ...(isAdmin ? (eventId ? { eventId } : {}) : { userId: session.userId }),
      },
      include: {
        event: { select: { id: true, title: true, startDate: true, category: true } },
        user: { select: { id: true, fullName: true, studentId: true } },
      },
      orderBy: { checkInTime: 'desc' },
    });

    // Compute percentage for the requesting user
    let attendancePercentage = 100;
    if (!isAdmin) {
      const totalEvents = await prisma.event.count({
        where: {
          isDeleted: false,
          endDate: { lte: new Date() },
          registrations: { some: { userId: session.userId, isDeleted: false } },
        },
      });
      if (totalEvents > 0) {
        attendancePercentage = Math.round((attendances.length / totalEvents) * 100);
      }
    }

    return ok({ attendances, attendancePercentage });
  } catch (e) {
    console.error('[GET /api/attendance]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const isAdminOrVolunteer =
      isAdminRole(session.roleName) ||
      session.roleName.toUpperCase() === 'VOLUNTEER';
    if (!isAdminOrVolunteer) return ERR.FORBIDDEN();

    const body = await req.json();
    const { qrToken, eventId } = body;
    if (!qrToken || !eventId) return ERR.VALIDATION('qrToken and eventId are required.');

    const registration = await prisma.registration.findFirst({
      where: { qrToken, eventId, isDeleted: false },
    });
    if (!registration) return ERR.NOT_FOUND('Registration');

    // Prevent duplicate check-in
    const existing = await prisma.attendance.findFirst({
      where: { registrationId: registration.id },
    });
    if (existing) {
      return ERR.CONFLICT('Student already checked in.');
    }

    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId,
        userId: registration.userId,
        checkInTime: new Date(),
        status: 'PRESENT',
        verifiedBy: session.userId,
      },
      include: {
        user: { select: { fullName: true, studentId: true } },
        event: { select: { title: true } },
      },
    });

    return ok({ attendance }, 201);
  } catch (e) {
    console.error('[POST /api/attendance]', e);
    return ERR.INTERNAL();
  }
}
