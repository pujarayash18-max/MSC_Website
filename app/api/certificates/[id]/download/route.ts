import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { id } = await params;
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: { user: { select: { fullName: true } } },
    });

    if (!cert) return ERR.NOT_FOUND('Certificate');

    const isAdmin = isAdminRole(session.roleName);
    if (cert.userId !== session.userId && !isAdmin) {
      return ERR.FORBIDDEN();
    }

    if (!cert.blobUrl) {
      return ERR.NOT_FOUND('Certificate PDF File');
    }

    // Direct redirect if remote blob URL
    if (cert.blobUrl.startsWith('http://') || cert.blobUrl.startsWith('https://')) {
      return NextResponse.redirect(cert.blobUrl);
    }

    // Local file fallback streaming
    const relativePath = cert.blobUrl.startsWith('/') ? cert.blobUrl.slice(1) : cert.blobUrl;
    const localFilePath = path.join(process.cwd(), 'public', relativePath);

    if (!fs.existsSync(localFilePath)) {
      return ERR.NOT_FOUND('Local Certificate PDF File');
    }

    const fileBuffer = await fs.promises.readFile(localFilePath);
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${cert.verificationCode}.pdf"`);

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (e) {
    console.error('[GET /api/certificates/[id]/download]', e);
    return ERR.INTERNAL();
  }
}
