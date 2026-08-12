import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

const CheckinSchema = z.object({
  eventId: z.string().min(1),
  qrToken: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const isAdmin = isAdminRole(session.roleName);
    if (!isAdmin) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = CheckinSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { eventId, qrToken } = parsed.data;

    // Find registration by qrToken
    const registration = await prisma.registration.findFirst({
      where: { qrToken, isDeleted: false },
      include: {
        user: { select: { id: true, fullName: true, studentId: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    });

    if (!registration) {
      return err('Invalid QR Code. Registration not found.', 404);
    }

    if (registration.eventId !== eventId) {
      return err(`This entry pass is for "${registration.event.title}", not this event!`, 400);
    }

    const now = new Date();

    // Check for existing attendance record
    const existing = await prisma.attendance.findFirst({
      where: { registrationId: registration.id },
    });

    if (existing) {
      // Update checkOutTime on repeat scan
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOutTime: now },
      });

      return ok({
        attendance: updated,
        student: registration.user,
        alreadyCheckedIn: true,
        message: `Student ${registration.user.fullName} already checked in at ${new Date(existing.checkInTime).toLocaleTimeString()}. Check-out recorded.`,
      });
    }

    // Create new Attendance record
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        checkInTime: now,
        status: 'PRESENT',
        verifiedBy: session.userId,
      },
    });

    // Award +50 community points to student
    await prisma.user.update({
      where: { id: registration.userId },
      data: {
        communityPoints: { increment: 50 },
      },
    });

    broadcastEvent('attendance_scanned', { attendance });

    return ok({
      attendance,
      student: registration.user,
      alreadyCheckedIn: false,
      message: `Verified! Attendance marked for ${registration.user.fullName} (+50 points awarded).`,
    }, 201);
  } catch (e) {
    console.error('[POST /api/attendance/checkin]', e);
    return ERR.INTERNAL();
  }
}
