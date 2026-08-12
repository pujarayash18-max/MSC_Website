import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isDeleted: false, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return ok({ sponsors });
  } catch (e) {
    console.error('[GET /api/sponsors]', e);
    return ERR.INTERNAL();
  }
}
