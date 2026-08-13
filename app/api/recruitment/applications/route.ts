import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const roleId = searchParams.get('roleId');
    const search = searchParams.get('search');

    const applications = await prisma.recruitmentApplication.findMany({
      where: {
        isDeleted: false,
        ...(status ? { status: status as any } : {}),
        ...(roleId ? { roleId } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { enrollment: { contains: search, mode: 'insensitive' } },
                { roleTitle: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        role: { select: { id: true, title: true, department: true, status: true } },
        user: { select: { id: true, fullName: true, email: true, profilePhoto: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ applications });
  } catch (e: any) {
    console.error('[GET /api/recruitment/applications]', e);
    return err(e?.message || 'Failed to fetch recruitment applications.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { roleId, roleTitle, fullName, email, enrollment, statement } = body;

    if (!roleTitle || !fullName || !email || !enrollment || !statement) {
      return err('Role title, full name, email, enrollment, and statement are required.', 400);
    }

    // Resolve target role if roleId provided
    let targetRoleId = roleId;
    if (targetRoleId) {
      const role = await prisma.recruitmentRole.findFirst({ where: { id: targetRoleId, isDeleted: false } });
      if (role && role.status === 'CLOSED') {
        return err('Applications for this role are currently closed.', 400);
      }
    } else {
      const role = await prisma.recruitmentRole.findFirst({
        where: { title: { equals: roleTitle, mode: 'insensitive' }, isDeleted: false },
      });
      if (role) {
        targetRoleId = role.id;
        if (role.status === 'CLOSED') {
          return err('Applications for this role are currently closed.', 400);
        }
      }
    }

    // Resolve student user ID if session exists or by email match
    let userId = session?.userId;
    if (!userId && email) {
      const u = await prisma.user.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } },
      });
      if (u) userId = u.id;
    }

    const application = await prisma.recruitmentApplication.create({
      data: {
        roleId: targetRoleId || undefined,
        roleTitle,
        fullName,
        email,
        enrollment,
        statement,
        userId: userId || undefined,
        status: 'PENDING',
      },
    });

    return ok({ application, message: 'Application submitted successfully! The admin team will review your submission.' }, 201);
  } catch (e: any) {
    console.error('[POST /api/recruitment/applications]', e);
    return err(e?.message || 'Failed to submit recruitment application.', 500);
  }
}
