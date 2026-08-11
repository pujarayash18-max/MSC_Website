import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isDeleted: false, status: 'active' },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });
    return ok({ members });
  } catch (e) {
    console.error('[GET /api/team]', e);
    return ERR.INTERNAL();
  }
}
