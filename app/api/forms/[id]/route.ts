import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { id } = await params;
    if (!id) return err('Form ID is required.', 400);

    await prisma.registrationForm.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok({ message: 'Form deleted successfully.' });
  } catch (e) {
    console.error('[DELETE /api/forms/[id]]', e);
    return ERR.INTERNAL();
  }
}
