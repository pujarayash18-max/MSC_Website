import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendRegistrationConfirmation, sendOnlineMeetingInvitation } from '@/lib/email';
import { broadcastEvent } from '@/app/api/realtime/route';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const isAdmin = isAdminRole(session.roleName);

    const rawRegistrations = await prisma.registration.findMany({
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

    // Deduplicate: keep only the latest registration per (eventId + userId)
    const seen = new Set<string>();
    const uniqueRegistrations: typeof rawRegistrations = [];
    const duplicateIdsToDelete: string[] = [];

    for (const reg of rawRegistrations) {
      const key = `${reg.eventId}_${reg.userId}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRegistrations.push(reg);
      } else {
        duplicateIdsToDelete.push(reg.id);
      }
    }

    // Auto-clean duplicate records in background
    if (duplicateIdsToDelete.length > 0) {
      prisma.registration
        .updateMany({
          where: { id: { in: duplicateIdsToDelete } },
          data: { isDeleted: true },
        })
        .catch((e) => console.error('[Registration Deduplicate Cleanup Error]', e));
    }

    return ok({ registrations: uniqueRegistrations });
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
    if (!eventId) return ERR.VALIDATION('eventId is required.');

    // Check event
    const event = await prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
    });
    if (!event) return ERR.NOT_FOUND('Event');

    // 1. Enforce Registration Closed Check
    const isOpenExplicitly =
      event.eventStatus === 'REGISTRATION_OPEN' ||
      (event.registrationStatus && event.registrationStatus.toLowerCase() === 'open');

    const isClosedStatus =
      !isOpenExplicitly &&
      (event.eventStatus === 'REGISTRATION_CLOSED' ||
        event.eventStatus === 'COMPLETED' ||
        event.eventStatus === 'CANCELLED' ||
        (event.registrationStatus && event.registrationStatus.toLowerCase().includes('closed')));

    const isPastDeadline =
      !isOpenExplicitly &&
      event.registrationEnd &&
      new Date() > new Date(event.registrationEnd);

    if (isClosedStatus || isPastDeadline) {
      return ERR.VALIDATION('Registration for this event is officially closed.');
    }

    // 2. Prevent Duplicate Registrations
    const existingRegistrations = await prisma.registration.findMany({
      where: {
        eventId,
        userId: session.userId,
        isDeleted: false,
      },
      orderBy: { submittedAt: 'desc' },
    });

    if (existingRegistrations.length > 0) {
      const targetReg = existingRegistrations[0];

      // Soft-delete extra duplicates if any exist
      if (existingRegistrations.length > 1) {
        const extraIds = existingRegistrations.slice(1).map((r) => r.id);
        await prisma.registration.updateMany({
          where: { id: { in: extraIds } },
          data: { isDeleted: true },
        });
      }

      const updated = await prisma.registration.update({
        where: { id: targetReg.id },
        data: {
          responses: responses || targetReg.responses,
        },
        include: {
          event: { select: { id: true, title: true, startDate: true } },
        },
      });

      if (responses && typeof responses === 'object') {
        let recipientEmail = session.email;
        let studentName = session.fullName || 'Student';
        const emailValue = Object.entries(responses).find(([key, val]) =>
          typeof val === 'string' && (key.toLowerCase().includes('email') || (val.includes('@') && val.includes('.')))
        )?.[1];
        if (emailValue && typeof emailValue === 'string' && emailValue.includes('@')) {
          recipientEmail = emailValue.trim();
        }
        const nameValue = Object.entries(responses).find(([key, val]) =>
          typeof val === 'string' && (key.toLowerCase().includes('name') || key.toLowerCase().includes('full'))
        )?.[1];
        if (nameValue && typeof nameValue === 'string' && nameValue.trim().length > 0) {
          studentName = nameValue.trim();
        }

        const eventModeStr = String(event.mode || '').toUpperCase();
        const isOnlineEvent =
          eventModeStr === 'ONLINE' ||
          eventModeStr === 'HYBRID' ||
          (Boolean(event.venue) && String(event.venue).startsWith('http'));

        if (isOnlineEvent) {
          sendOnlineMeetingInvitation(
            recipientEmail,
            studentName,
            updated.event?.title || 'Event',
            event.venue || 'https://teams.microsoft.com'
          ).catch(() => {});
        } else {
          sendRegistrationConfirmation(
            recipientEmail,
            studentName,
            updated.event?.title || 'Event',
            updated.qrToken
          ).catch(() => {});
        }
      }

      return ok({ registration: updated, isExisting: true, isUpdated: true }, 200);
    }

    // 3. Resolve or auto-create a valid RegistrationForm for this event
    let targetForm = await prisma.registrationForm.findFirst({
      where: {
        OR: [
          ...(formId && formId !== 'form_default' ? [{ id: formId }] : []),
          { eventId: eventId, isDeleted: false },
        ],
      },
    });

    if (!targetForm) {
      targetForm = await prisma.registrationForm.create({
        data: {
          eventId: eventId,
          formName: `Default Form - ${event.title}`,
          formType: 'COLLEGE_REGISTRATION',
          isEnabled: true,
          status: 'active',
        },
      });
    }

    const validFormId = targetForm.id;

    // 4. Check Capacity & Waitlist Logic
    const activeCount = await prisma.registration.count({
      where: { eventId, registrationStatus: { in: ['APPROVED', 'PENDING', 'CHECKED_IN'] }, isDeleted: false },
    });

    const isAtCapacity =
      (event.capacity > 0 && activeCount >= event.capacity) ||
      event.remainingSeats <= 0;

    const initialStatus = isAtCapacity ? 'WAITLISTED' : 'APPROVED';

    const qrToken = crypto.randomUUID();

    const [registration] = await prisma.$transaction([
      prisma.registration.create({
        data: {
          eventId,
          userId: session.userId,
          formId: validFormId,
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
          remainingSeats: isAtCapacity ? 0 : Math.max(0, event.remainingSeats - 1),
          waitlistCount: isAtCapacity ? { increment: 1 } : undefined,
        },
      }),
    ]);

    // Extract recipient email entered in form or fallback to logged-in user email
    let recipientEmail = session.email;
    let studentName = session.fullName || 'Student';

    if (responses && typeof responses === 'object') {
      const emailValue = Object.entries(responses).find(([key, val]) =>
        typeof val === 'string' &&
        (key.toLowerCase().includes('email') || (val.includes('@') && val.includes('.')))
      )?.[1];

      if (emailValue && typeof emailValue === 'string' && emailValue.includes('@')) {
        recipientEmail = emailValue.trim();
      }

      const nameValue = Object.entries(responses).find(([key, val]) =>
        typeof val === 'string' &&
        (key.toLowerCase().includes('name') || key.toLowerCase().includes('full'))
      )?.[1];

      if (nameValue && typeof nameValue === 'string' && nameValue.trim().length > 0) {
        studentName = nameValue.trim();
      }
    }

    // Send confirmation email asynchronously to the entered email address
    if (recipientEmail) {
      const eventModeStr = String(event.mode || '').toUpperCase();
      const isOnlineEvent =
        eventModeStr === 'ONLINE' ||
        eventModeStr === 'HYBRID' ||
        (Boolean(event.venue) && String(event.venue).startsWith('http'));

      if (isOnlineEvent) {
        sendOnlineMeetingInvitation(
          recipientEmail,
          studentName,
          registration.event?.title || 'Event',
          event.venue || 'https://teams.microsoft.com'
        ).catch((e) => console.error('[Online Email Send Failed]', e));
      } else {
        sendRegistrationConfirmation(
          recipientEmail,
          studentName,
          registration.event?.title || 'Event',
          qrToken
        ).catch((e) => console.error('[Email Send Failed]', e));
      }
    }

    broadcastEvent('registration_created', { registration });

    return ok({ registration }, 201);
  } catch (e) {
    console.error('[POST /api/registrations]', e);
    return ERR.INTERNAL();
  }
}
