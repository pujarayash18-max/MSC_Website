import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { broadcastEvent } from '@/app/api/realtime/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const body = await req.json();
    const { eventId } = body;
    if (!eventId) return ERR.VALIDATION('eventId is required.');

    // Fetch Event
    const event = await prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
    });
    if (!event) return ERR.NOT_FOUND('Event');

    // Find student's active registration for this event
    const registration = await prisma.registration.findFirst({
      where: {
        eventId,
        userId: session.userId,
        isDeleted: false,
      },
    });

    if (!registration) {
      return err('You must register for this event before joining the Microsoft Teams session.', 403);
    }

    if (registration.registrationStatus === 'WAITLISTED') {
      return err('Your registration is currently on the waitlist. You will be notified if a seat opens up.', 403);
    }

    const meetingUrl = event.venue || 'https://teams.microsoft.com';
    const now = new Date();

    // Check if attendance already recorded
    const existing = await prisma.attendance.findFirst({
      where: { registrationId: registration.id },
    });

    if (existing) {
      return ok({
        alreadyCheckedIn: true,
        meetingUrl,
        message: 'Already checked in! Redirecting to Microsoft Teams session...',
      });
    }

    // Record online MS Teams check-in
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId: event.id,
        userId: session.userId,
        checkInTime: now,
        status: 'PRESENT',
        verifiedBy: 'MS_TEAMS_AUTO_CHECKIN',
      },
    });

    // Update Registration attendanceStatus
    await prisma.registration.update({
      where: { id: registration.id },
      data: { attendanceStatus: 'PRESENT' },
    });

    // Award +50 community points to student
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        communityPoints: { increment: 50 },
      },
    });

    broadcastEvent('attendance_scanned', { attendance, mode: 'ONLINE' });

    return ok({
      alreadyCheckedIn: false,
      meetingUrl,
      message: 'Verified! Marked PRESENT for MS Teams Session (+50 Points Awarded). Redirecting...',
    }, 201);
  } catch (e) {
    console.error('[POST /api/attendance/online-checkin]', e);
    return ERR.INTERNAL();
  }
}
