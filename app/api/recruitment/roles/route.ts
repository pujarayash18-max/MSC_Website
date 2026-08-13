import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET() {
  try {
    const roles = await prisma.recruitmentRole.findMany({
      where: { isDeleted: false },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return ok({ roles });
  } catch (e) {
    console.error('[GET /api/recruitment/roles]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { title, department, description, status } = body;

    if (!title || !description) {
      return err('Title and description are required.', 400);
    }

    const role = await prisma.recruitmentRole.create({
      data: {
        title,
        department: department || 'All Branches',
        description,
        status: status === 'CLOSED' ? 'CLOSED' : 'OPEN',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Created Recruitment Role: ${role.title}`,
        module: 'TEAM_PROFILES',
        status: 'SUCCESS',
        details: `Created new open role "${role.title}" for department ${role.department}`,
      },
    }).catch(() => {});

    return ok({ role }, 201);
  } catch (e: any) {
    console.error('[POST /api/recruitment/roles]', e);
    return err(e?.message || 'Failed to create recruitment role.', 500);
  }
}
