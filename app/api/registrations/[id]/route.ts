import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true, startDate: true, capacity: true } },
        user: { select: { id: true, fullName: true, email: true, studentId: true } },
      },
    });

    if (!reg) return ERR.NOT_FOUND('Registration');

    const isAdmin = isAdminRole(session.roleName);
    if (reg.userId !== session.userId && !isAdmin) return ERR.FORBIDDEN();

    return ok({ registration: reg });
  } catch (e) {
    console.error('[GET /api/registrations/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const body = await req.json();
    const { registrationStatus, notes } = body;

    const existing = await prisma.registration.findUnique({
      where: { id },
      include: { event: true, user: true },
    });

    if (!existing) return ERR.NOT_FOUND('Registration');

    // Strict Capacity Enforcement Guard when approving
    if (registrationStatus === 'APPROVED') {
      const event = existing.event;
      if (!event.capacity || event.capacity <= 0) {
        return err('Please set an event capacity limit before approving registrations.', 400);
      }

      const approvedCount = await prisma.registration.count({
        where: {
          eventId: event.id,
          registrationStatus: 'APPROVED',
          isDeleted: false,
          id: { not: id }, // exclude current registration
        },
      });

      if (approvedCount >= event.capacity) {
        return err(`Cannot approve: Event capacity limit of ${event.capacity} reached. Show "Capacity Full" state.`, 400);
      }
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        ...(registrationStatus ? { registrationStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { event: true, user: true },
    });

    // Notify student when status changes
    if (registrationStatus && registrationStatus !== existing.registrationStatus) {
      const statusTitle =
        registrationStatus === 'APPROVED'
          ? 'Registration Approved!'
          : registrationStatus === 'WAITLISTED'
          ? 'Added to Event Waitlist'
          : registrationStatus === 'REJECTED'
          ? 'Registration Status Update'
          : `Registration Status: ${registrationStatus}`;

      const statusMsg =
        registrationStatus === 'APPROVED'
          ? `Your registration for "${existing.event.title}" has been approved! Present your QR pass at check-in.`
          : registrationStatus === 'WAITLISTED'
          ? `You have been placed on the waitlist for "${existing.event.title}". We will notify you if a seat opens up.`
          : `Your registration status for "${existing.event.title}" is now ${registrationStatus}.`;

      createAndSendNotification({
        userId: existing.userId,
        userEmail: existing.user.email,
        title: statusTitle,
        message: statusMsg,
        type: registrationStatus === 'APPROVED' ? 'REGISTRATION_APPROVED' : 'REGISTRATION_WAITLISTED',
        link: `/dashboard/registrations`,
      }).catch(() => {});
    }

    return ok({ registration: updated });
  } catch (e) {
    console.error('[PATCH /api/registrations/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const existing = await prisma.registration.findUnique({
      where: { id },
      include: { event: true, user: true },
    });

    if (!existing || existing.isDeleted) {
      return ERR.NOT_FOUND('Registration');
    }

    const isAdmin = isAdminRole(session.roleName);
    if (existing.userId !== session.userId && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    // 1. Mark registration as cancelled/deleted, status REJECTED, and expire the QR token
    await prisma.registration.update({
      where: { id },
      data: {
        isDeleted: true,
        registrationStatus: 'REJECTED',
        qrToken: `EXPIRED_${existing.qrToken}_${Date.now()}`,
      },
    });

    // 2. Increase available seat count for the event
    await prisma.event.update({
      where: { id: existing.eventId },
      data: {
        remainingSeats: { increment: 1 },
      },
    });

    // 3. Auto-promote earliest waitlisted student if any
    const firstWaitlisted = await prisma.registration.findFirst({
      where: {
        eventId: existing.eventId,
        registrationStatus: 'WAITLISTED',
        isDeleted: false,
      },
      orderBy: { submittedAt: 'asc' },
      include: { user: true, event: true },
    });

    if (firstWaitlisted) {
      await prisma.registration.update({
        where: { id: firstWaitlisted.id },
        data: { registrationStatus: 'APPROVED' },
      });

      // Notify the promoted student
      createAndSendNotification({
        userId: firstWaitlisted.userId,
        userEmail: firstWaitlisted.user.email,
        title: 'Seat Available! Registration Approved',
        message: `A seat opened up for "${firstWaitlisted.event.title}"! You have been promoted from the waitlist to Approved.`,
        type: 'REGISTRATION_APPROVED',
        link: '/dashboard/registrations',
      }).catch(() => {});
    }

    return ok({ message: 'Registration cancelled successfully.' });
  } catch (e) {
    console.error('[DELETE /api/registrations/[id]]', e);
    return ERR.INTERNAL();
  }
}
