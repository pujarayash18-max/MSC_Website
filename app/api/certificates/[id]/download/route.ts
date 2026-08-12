import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { generateCertificatePdf } from '@/lib/certificates';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true } },
        event: { select: { title: true, startDate: true } },
        template: { select: { backgroundBlobUrl: true, placeholders: true } },
      },
    });

    if (!cert) return ERR.NOT_FOUND('Certificate');

    const isAdmin = isAdminRole(session.roleName);
    if (cert.userId !== session.userId && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    // 1. Try serving existing local file
    if (cert.blobUrl && cert.blobUrl.startsWith('/uploads/')) {
      const relativePath = cert.blobUrl.startsWith('/') ? cert.blobUrl.slice(1) : cert.blobUrl;
      const localFilePath = path.join(process.cwd(), 'public', relativePath);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = await fs.promises.readFile(localFilePath);
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="${cert.verificationCode}.pdf"`);
        return new NextResponse(new Uint8Array(fileBuffer), { status: 200, headers });
      }
    }

    // 2. On-the-fly PDF Generation Fallback
    const placeholders = (cert.template?.placeholders as any[]) || [];
    const namePos = placeholders.find((p: any) => p.field === 'studentName');

    const { pdfBuffer } = await generateCertificatePdf({
      recipientName: cert.user.fullName || 'Valued Participant',
      eventTitle: cert.event?.title || 'Microsoft Campus Club Event',
      issueDate: cert.event?.startDate ? new Date(cert.event.startDate).toISOString() : new Date().toISOString(),
      verificationCode: cert.verificationCode,
      certificateType: cert.type,
      backgroundBlobUrl: cert.template?.backgroundBlobUrl,
      namePosition: namePos ? { x: namePos.x, y: namePos.y } : undefined,
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${cert.verificationCode}.pdf"`);
    return new NextResponse(new Uint8Array(pdfBuffer), { status: 200, headers });
  } catch (e) {
    console.error('[GET /api/certificates/[id]/download]', e);
    return ERR.INTERNAL();
  }
}
