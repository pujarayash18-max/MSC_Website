import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

// Public certificate verification endpoint — no auth needed
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ verificationCode: id }, { id }],
        isDeleted: false,
      },
      include: {
        user: { select: { fullName: true, studentId: true, college: true } },
        event: { select: { title: true, startDate: true, category: true } },
        template: { select: { templateName: true } },
      },
    });

    if (!certificate) return ERR.NOT_FOUND('Certificate');

    return ok({
      certificate: {
        verificationCode: certificate.verificationCode,
        type: certificate.type,
        generatedAt: certificate.generatedAt,
        blobUrl: certificate.blobUrl,
        student: certificate.user,
        event: certificate.event,
        template: certificate.template?.templateName,
        status: 'Verified',
      },
    });
  } catch (e) {
    console.error('[GET /api/certificates/[id]/verify]', e);
    return ERR.INTERNAL();
  }
}
