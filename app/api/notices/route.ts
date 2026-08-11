import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        isDeleted: false,
        status: 'active',
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
    });
    return ok({ notices });
  } catch (e) {
    console.error('[GET /api/notices]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!ADMIN_ROLES.includes(session.roleName as SystemRoleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const notice = await prisma.notice.create({ data: body });
    return ok({ notice }, 201);
  } catch (e) {
    console.error('[POST /api/notices]', e);
    return ERR.INTERNAL();
  }
}
