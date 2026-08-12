import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendRegistrationConfirmation } from '@/lib/email';
import { broadcastEvent } from '@/app/api/realtime/route';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const isAdmin = isAdminRole(session.roleName);

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
    // Count existing approved / confirmed registrations
    const approvedCount = await prisma.registration.count({
      where: { eventId, registrationStatus: 'APPROVED', isDeleted: false },
    });

    const isAtCapacity = event.capacity > 0 && approvedCount >= event.capacity;
    const initialStatus = isAtCapacity ? 'WAITLISTED' : 'PENDING';

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
          registrationStatus: initialStatus,
        },
        include: {
          event: { select: { id: true, title: true, startDate: true } },
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          remainingSeats: Math.max(0, event.remainingSeats - 1),
          waitlistCount: isAtCapacity ? { increment: 1 } : undefined,
        },
      }),
    ]);

    // Send confirmation email asynchronously
    if (session.email) {
      sendRegistrationConfirmation(
        session.email,
        session.fullName || 'Student',
        registration.event?.title || 'Event',
        qrToken
      ).catch((e) => console.error('[Email Send Failed]', e));
    }

    broadcastEvent('registration_created', { registration });

    return ok({ registration }, 201);
  } catch (e) {
    console.error('[POST /api/registrations]', e);
    return ERR.INTERNAL();
  }
}
