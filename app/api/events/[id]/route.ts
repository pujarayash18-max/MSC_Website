import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id }, { slug: id }],
      },
      include: {
        speakers: { include: { speaker: true } },
        sponsors: { include: { sponsor: true } },
        agendaItems: { orderBy: { displayOrder: 'asc' } },
        resources: {
          where: { isDeleted: false, visibility: 'PUBLIC' },
          orderBy: { publishTime: 'desc' },
        },
        _count: { select: { registrations: true, attendances: true } },
      },
    });

    if (!event) return ERR.NOT_FOUND('Event');
    return ok({ event });
  } catch (e) {
    console.error('[GET /api/events/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const { id } = await params;
    const body = await req.json();

    const existingEvent = await prisma.event.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingEvent) return ERR.NOT_FOUND('Event');

    const updateData: Record<string, any> = {};

    if (typeof body.title === 'string' && body.title.trim()) {
      updateData.title = body.title.trim();
    }

    if (typeof body.shortDescription === 'string' && body.shortDescription.trim()) {
      updateData.shortDescription = body.shortDescription.trim();
    }

    if (typeof body.description === 'string' && body.description.trim()) {
      updateData.description = body.description.trim();
    }

    if (typeof body.banner === 'string' && body.banner.trim()) {
      updateData.banner = body.banner.trim();
    }

    if (typeof body.venue === 'string') {
      updateData.venue = body.venue.trim();
    }

    if (typeof body.capacity === 'number' && !isNaN(body.capacity)) {
      const cap = Math.max(1, Math.floor(body.capacity));
      updateData.capacity = cap;
      if (cap > existingEvent.capacity) {
        const diff = cap - existingEvent.capacity;
        updateData.remainingSeats = existingEvent.remainingSeats + diff;
      }
    }

    if (typeof body.mode === 'string') {
      const modeKey = body.mode.trim().toUpperCase().replace(/\s+/g, '_');
      const validModes = ['ONLINE', 'OFFLINE', 'HYBRID'];
      if (validModes.includes(modeKey)) {
        updateData.mode = modeKey;
      }
    }

    if (typeof body.category === 'string') {
      const catKey = body.category.trim().toUpperCase().replace(/\s+/g, '_');
      const validCategories = [
        'WORKSHOP', 'HACKATHON', 'WEBINAR', 'BOOTCAMP',
        'AZURE', 'AI', 'GITHUB', 'COMMUNITY_MEETUP', 'CONFERENCE'
      ];
      if (validCategories.includes(catKey)) {
        updateData.category = catKey;
      }
    }

    if (typeof body.eventStatus === 'string') {
      const statusKey = body.eventStatus.trim().toUpperCase().replace(/\s+/g, '_');
      const validStatuses = [
        'DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED',
        'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ARCHIVED'
      ];
      if (validStatuses.includes(statusKey)) {
        updateData.eventStatus = statusKey;

        if (statusKey === 'REGISTRATION_OPEN' || statusKey === 'PUBLISHED' || statusKey === 'UPCOMING') {
          updateData.registrationStatus = 'Open';
          if (existingEvent.registrationEnd && new Date(existingEvent.registrationEnd) <= new Date()) {
            const extendedEnd = new Date();
            extendedEnd.setDate(extendedEnd.getDate() + 7);
            updateData.registrationEnd = extendedEnd;
          }
        } else if (statusKey === 'REGISTRATION_CLOSED' || statusKey === 'COMPLETED' || statusKey === 'CANCELLED') {
          updateData.registrationStatus = 'Closed';
        }
      }
    }

    if (body.startDate && !isNaN(Date.parse(body.startDate))) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.endDate && !isNaN(Date.parse(body.endDate))) {
      updateData.endDate = new Date(body.endDate);
    }
    if (body.registrationStart && !isNaN(Date.parse(body.registrationStart))) {
      updateData.registrationStart = new Date(body.registrationStart);
    }
    if (body.registrationEnd && !isNaN(Date.parse(body.registrationEnd))) {
      updateData.registrationEnd = new Date(body.registrationEnd);
    }

    const event = await prisma.event.update({
      where: { id: existingEvent.id },
      data: updateData,
    });

    return ok({ event });
  } catch (e) {
    console.error('[PATCH /api/events/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const { id } = await params;
    await prisma.event.update({ where: { id }, data: { isDeleted: true } });
    return ok({ message: 'Event deleted.' });
  } catch (e) {
    console.error('[DELETE /api/events/[id]]', e);
    return ERR.INTERNAL();
  }
}
