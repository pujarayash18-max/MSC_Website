import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    const winners = await prisma.winnerShowcase.findMany({
      where: {
        isDeleted: false,
        published: true,
        ...(eventId ? { eventId } : {}),
      },
      include: {
        event: { select: { id: true, title: true, startDate: true, category: true } },
        user: { select: { fullName: true, studentId: true, profilePhoto: true } },
      },
      orderBy: [{ event: { startDate: 'desc' } }, { rank: 'asc' }],
    });

    return ok({ winners });
  } catch (e) {
    console.error('[GET /api/winners]', e);
    return ERR.INTERNAL();
  }
}
