import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    const session = await getSession();
    const isAdmin = session && ADMIN_ROLES.includes(session.roleName as SystemRoleName);

    // Non-admins can only see PUBLIC resources
    const visibility = isAdmin ? undefined : { in: ['PUBLIC'] as never[] };

    const resources = await prisma.resource.findMany({
      where: {
        isDeleted: false,
        ...(eventId ? { eventId } : {}),
        ...(visibility ? { visibility } : {}),
      },
      include: {
        event: { select: { id: true, title: true } },
      },
      orderBy: { publishTime: 'desc' },
    });

    return ok({ resources });
  } catch (e) {
    console.error('[GET /api/resources]', e);
    return ERR.INTERNAL();
  }
}
