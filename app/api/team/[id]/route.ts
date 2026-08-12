import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) return ERR.NOT_FOUND('Team member');

    await prisma.teamMember.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok({ message: 'Team member deleted successfully.' });
  } catch (e) {
    console.error('[DELETE /api/team/[id]]', e);
    return ERR.INTERNAL();
  }
}
