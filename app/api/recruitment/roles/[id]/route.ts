import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const body = await req.json();
    const { title, department, description, status, displayOrder } = body;

    const existing = await prisma.recruitmentRole.findFirst({ where: { id, isDeleted: false } });
    if (!existing) return ERR.NOT_FOUND('Recruitment Role');

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (department !== undefined) updateData.department = department;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status === 'CLOSED' ? 'CLOSED' : 'OPEN';
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);

    const role = await prisma.recruitmentRole.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Updated Recruitment Role: ${role.title}`,
        module: 'TEAM_PROFILES',
        status: 'SUCCESS',
        details: `Updated role status to ${role.status}`,
      },
    }).catch(() => {});

    return ok({ role });
  } catch (e: any) {
    console.error('[PATCH /api/recruitment/roles/[id]]', e);
    return err(e?.message || 'Failed to update recruitment role.', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const existing = await prisma.recruitmentRole.findFirst({ where: { id, isDeleted: false } });
    if (!existing) return ERR.NOT_FOUND('Recruitment Role');

    await prisma.recruitmentRole.update({
      where: { id },
      data: { isDeleted: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName || 'Admin',
        role: session.roleName,
        action: `Deleted Recruitment Role: ${existing.title}`,
        module: 'TEAM_PROFILES',
        status: 'SUCCESS',
        details: `Soft-deleted role ${existing.title}`,
      },
    }).catch(() => {});

    return ok({ message: 'Recruitment role deleted.' });
  } catch (e: any) {
    console.error('[DELETE /api/recruitment/roles/[id]]', e);
    return err(e?.message || 'Failed to delete recruitment role.', 500);
  }
}
