import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const roles = await prisma.role.findMany({
      orderBy: { roleName: 'asc' },
      include: {
        _count: { select: { users: true } },
      },
    });

    return ok({ roles });
  } catch (e) {
    console.error('[GET /api/rbac]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { roleId, permissions } = body;

    if (!roleId || !permissions) {
      return err('roleId and permissions are required.', 400);
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: { permissions },
    });

    return ok({ role: updatedRole, message: 'Role permissions updated and revalidated live in database.' });
  } catch (e) {
    console.error('[PATCH /api/rbac]', e);
    return ERR.INTERNAL();
  }
}
