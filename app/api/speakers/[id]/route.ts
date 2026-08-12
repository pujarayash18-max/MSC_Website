import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const speaker = await prisma.speaker.findFirst({
      where: {
        isDeleted: false,
        OR: [{ id }, { name: { equals: id.replace(/-/g, ' '), mode: 'insensitive' } }]
      },
      include: {
        events: {
          include: {
            event: { select: { id: true, title: true, slug: true, startDate: true, banner: true, shortDescription: true } }
          }
        }
      }
    });

    if (!speaker) return ERR.NOT_FOUND('Speaker');
    return ok({ speaker });
  } catch (e) {
    console.error('[GET /api/speakers/[id]]', e);
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

    const speaker = await prisma.speaker.update({
      where: { id },
      data: body
    });

    return ok({ speaker });
  } catch (e) {
    console.error('[PATCH /api/speakers/[id]]', e);
    return ERR.INTERNAL();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const { id } = await params;
    await prisma.speaker.update({
      where: { id },
      data: { isDeleted: true }
    });

    return ok({ message: 'Speaker deleted.' });
  } catch (e) {
    console.error('[DELETE /api/speakers/[id]]', e);
    return ERR.INTERNAL();
  }
}
