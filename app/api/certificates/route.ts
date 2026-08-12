import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { generateCertificatePdf } from '@/lib/certificates';
import { uploadFile } from '@/lib/storage';
import { sendCertificateIssued } from '@/lib/email';

const IssueCertSchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  templateId: z.string().optional(),
  type: z.enum(['PARTICIPATION', 'WINNER', 'VOLUNTEER', 'SPEAKER', 'ORGANIZER']).default('PARTICIPATION'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const isAdmin = isAdminRole(session.roleName);
    const { searchParams } = req.nextUrl;
    const targetUserId = searchParams.get('userId');

    const certificates = await prisma.certificate.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin ? (targetUserId ? { userId: targetUserId } : {}) : { userId: session.userId }),
      },
      include: {
        event: { select: { id: true, title: true, startDate: true, category: true } },
        user: { select: { fullName: true, studentId: true, email: true } },
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = IssueCertSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { userId, eventId, templateId, type } = parsed.data;

    const student = await prisma.user.findUnique({ where: { id: userId } });
    if (!student) return ERR.NOT_FOUND('Student User');

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return ERR.NOT_FOUND('Event');

    const template = templateId
      ? await prisma.certificateTemplate.findUnique({ where: { id: templateId } })
      : await prisma.certificateTemplate.findFirst({ where: { isDeleted: false } });

    const verificationCode = `MCC-CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const issueDate = new Date().toISOString();

    // Generate PDF & QR
    const { pdfBuffer, qrBuffer } = await generateCertificatePdf({
      recipientName: student.fullName,
      eventTitle: event.title,
      issueDate,
      verificationCode,
      certificateType: type,
      backgroundBlobUrl: template?.backgroundBlobUrl,
    });

    // Upload PDF and QR to storage
    const pdfBlobUrl = await uploadFile('certificates', pdfBuffer, `${verificationCode}.pdf`, 'application/pdf');
    const qrCodeUrl = await uploadFile('certificates', qrBuffer, `${verificationCode}_qr.png`, 'image/png');

    // Create Certificate record
    const certificate = await prisma.certificate.create({
      data: {
        userId: student.id,
        eventId: event.id,
        templateId: template?.id,
        type,
        verificationCode,
        blobUrl: pdfBlobUrl,
        qrCodeUrl,
        emailStatus: 'PENDING',
        generatedAt: new Date(issueDate),
      },
      include: {
        event: { select: { title: true } },
        user: { select: { fullName: true, email: true } },
      },
    });

    // Send certificate email asynchronously and update status
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/certificates/${certificate.id}/download`;

    sendCertificateIssued(student.email, student.fullName, event.title, downloadUrl, verificationCode)
      .then((sent) => {
        prisma.certificate.update({
          where: { id: certificate.id },
          data: { emailStatus: sent ? 'SENT' : 'FAILED' },
        }).catch(() => {});
      })
      .catch(() => {});

    return ok({ certificate }, 201);
  } catch (e) {
    console.error('[POST /api/certificates]', e);
    return ERR.INTERNAL();
  }
}
