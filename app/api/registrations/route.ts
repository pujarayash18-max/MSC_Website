import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const isAdmin = ADMIN_ROLES.includes(session.roleName as SystemRoleName);

    const registrations = await prisma.registration.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin ? (eventId ? { eventId } : {}) : { userId: session.userId }),
        ...(eventId && !isAdmin ? { eventId } : {}),
      },
      include: {
        event: { select: { id: true, title: true, slug: true, startDate: true, banner: true } },
        user: { select: { id: true, fullName: true, email: true, studentId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return ok({ registrations });
  } catch (e) {
    console.error('[GET /api/registrations]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const body = await req.json();
    const { eventId, formId, responses } = body;
    if (!eventId || !formId) return ERR.VALIDATION('eventId and formId are required.');

    // Check event capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
    });
    if (!event) return ERR.NOT_FOUND('Event');
    if (event.remainingSeats <= 0 && !event.waitlistEnabled) {
      return ERR.CONFLICT('This event is fully booked.');
    }

    // Prevent duplicate registration
    const existing = await prisma.registration.findFirst({
      where: { eventId, userId: session.userId, isDeleted: false },
    });
    if (existing) return ERR.CONFLICT('You are already registered for this event.');

    const qrToken = crypto.randomUUID();

    const [registration] = await prisma.$transaction([
      prisma.registration.create({
        data: {
          eventId,
          userId: session.userId,
          formId,
          formType: 'College Registration',
          responses: responses || {},
          qrToken,
          registrationStatus: 'PENDING',
        },
        include: {
          event: { select: { id: true, title: true, startDate: true } },
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          remainingSeats: Math.max(0, event.remainingSeats - 1),
          waitlistCount: event.remainingSeats <= 0 ? { increment: 1 } : undefined,
        },
      }),
    ]);

    return ok({ registration }, 201);
  } catch (e) {
    console.error('[POST /api/registrations]', e);
    return ERR.INTERNAL();
  }
}
