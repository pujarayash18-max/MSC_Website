import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.userId, isDeleted: false },
      include: {
        event: { select: { id: true, title: true, startDate: true, category: true } },
        template: { select: { templateName: true, certificateType: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return ok({ certificates });
  } catch (e) {
    console.error('[GET /api/certificates]', e);
    return ERR.INTERNAL();
  }
}
