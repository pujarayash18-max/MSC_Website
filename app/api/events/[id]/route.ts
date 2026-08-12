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

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        ...(body.startDate ? { startDate: new Date(body.startDate) } : {}),
        ...(body.endDate ? { endDate: new Date(body.endDate) } : {}),
      },
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
