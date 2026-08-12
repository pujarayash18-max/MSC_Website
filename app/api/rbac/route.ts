import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { SystemRoleName } from '@prisma/client';
import { DEFAULTPERMISSIONMATRIX, SystemRoleName as TS_SystemRoleName } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DISPLAY_TO_ENUM: Record<string, SystemRoleName> = {
  'Super Admin': SystemRoleName.SUPER_ADMIN,
  'Website Admin': SystemRoleName.WEBSITE_ADMIN,
  'Event Manager': SystemRoleName.EVENT_MANAGER,
  'Content Manager': SystemRoleName.CONTENT_MANAGER,
  'Media Manager': SystemRoleName.MEDIA_MANAGER,
  'Faculty Coordinator': SystemRoleName.FACULTY_COORDINATOR,
  'President': SystemRoleName.PRESIDENT,
  'Vice President': SystemRoleName.VICE_PRESIDENT,
  'Technical Lead': SystemRoleName.TECHNICAL_LEAD,
  'Student': SystemRoleName.STUDENT,
  'Volunteer': SystemRoleName.VOLUNTEER,
};

const ALL_DISPLAY_ROLES: TS_SystemRoleName[] = [
  'Super Admin',
  'Website Admin',
  'Event Manager',
  'Content Manager',
  'Media Manager',
  'Faculty Coordinator',
  'President',
  'Vice President',
  'Technical Lead',
  'Student',
  'Volunteer',
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    let roles = await prisma.role.findMany({
      orderBy: { roleName: 'asc' },
      include: {
        _count: { select: { users: true } },
      },
    });

    // Ensure all 11 core roles exist in DB
    for (const displayRole of ALL_DISPLAY_ROLES) {
      const enumRole = DISPLAY_TO_ENUM[displayRole];
      const exists = roles.some((r) => r.roleName === enumRole);

      if (!exists && enumRole) {
        const defaultPerms = DEFAULTPERMISSIONMATRIX[displayRole] || DEFAULTPERMISSIONMATRIX['Student'];
        await prisma.role.create({
          data: {
            roleName: enumRole,
            description: `${displayRole} system access role`,
            permissions: defaultPerms as any,
          },
        });
      }
    }

    // Re-fetch after ensuring seeding
    roles = await prisma.role.findMany({
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
    const { roleId, roleName, permissions } = body;

    if (!permissions) {
      return err('Permissions object is required.', 400);
    }

    let updatedRole;

    if (roleId) {
      updatedRole = await prisma.role.update({
        where: { id: roleId },
        data: { permissions },
      });
    } else if (roleName) {
      const targetEnum = DISPLAY_TO_ENUM[roleName] || (roleName as SystemRoleName);
      updatedRole = await prisma.role.upsert({
        where: { roleName: targetEnum },
        update: { permissions },
        create: {
          roleName: targetEnum,
          description: `${roleName} system role`,
          permissions,
        },
      });
    } else {
      return err('Either roleId or roleName is required.', 400);
    }

    // Write real Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Super Admin',
        role: session.roleName,
        action: `Updated RBAC Permission Matrix for ${roleName || updatedRole.roleName}`,
        module: 'RBAC',
        status: 'SUCCESS',
        details: `Saved live permission matrix for role ${roleName || updatedRole.roleName}`,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '103.24.18.5',
        browser: req.headers.get('user-agent') || 'Browser',
      },
    }).catch((e) => console.error('Failed to create audit log:', e));

    return ok({ role: updatedRole, message: 'Role permissions updated live in database.' });
  } catch (e) {
    console.error('[PATCH /api/rbac]', e);
    return ERR.INTERNAL();
  }
}
