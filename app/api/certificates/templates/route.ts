import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { generateCertificatePdf } from '@/lib/certificates';
import fs from 'fs';
import path from 'path';

const TemplateSchema = z.object({
  templateName: z.string().min(2),
  certificateType: z.enum(['PARTICIPATION', 'WINNER', 'VOLUNTEER', 'SPEAKER', 'ORGANIZER']),
  backgroundBlobUrl: z.string().min(1),
  placeholders: z.any().default([]),
  eventId: z.string().optional(),
  issueAudience: z.enum(['ATTENDED_ONLY', 'ALL_REGISTERED']).default('ATTENDED_ONLY'),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const templates = await prisma.certificateTemplate.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ templates });
  } catch (e) {
    console.error('[GET /api/certificates/templates]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = TemplateSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const template = await prisma.certificateTemplate.create({
      data: {
        templateName: parsed.data.templateName,
        certificateType: parsed.data.certificateType,
        backgroundBlobUrl: parsed.data.backgroundBlobUrl,
        placeholders: parsed.data.placeholders ?? [],
      },
    });

    let issuedCount = 0;
    if (parsed.data.eventId) {
      const eventId = parsed.data.eventId;
      const issueAudience = parsed.data.issueAudience || 'ATTENDED_ONLY';

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { title: true, startDate: true },
      });

      let targetUserIds: string[] = [];

      if (issueAudience === 'ATTENDED_ONLY') {
        const attendances = await prisma.attendance.findMany({
          where: { eventId, status: { in: ['PRESENT', 'LATE'] } },
          select: { userId: true },
        });
        const attendedRegs = await prisma.registration.findMany({
          where: {
            eventId,
            isDeleted: false,
            OR: [
              { attendanceStatus: { in: ['PRESENT', 'LATE'] } },
              { registrationStatus: { in: ['CHECKED_IN', 'COMPLETED'] } },
            ],
          },
          select: { userId: true },
        });
        const userSet = new Set([
          ...attendances.map((a) => a.userId),
          ...attendedRegs.map((r) => r.userId),
        ]);
        targetUserIds = Array.from(userSet);

        // Fallback: If no attendance records marked yet for this event, fallback to registered students
        if (targetUserIds.length === 0) {
          const registrations = await prisma.registration.findMany({
            where: {
              eventId,
              isDeleted: false,
              registrationStatus: { in: ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'PENDING'] },
            },
            select: { userId: true },
          });
          targetUserIds = registrations.map((r) => r.userId);
        }
      } else {
        const registrations = await prisma.registration.findMany({
          where: {
            eventId,
            isDeleted: false,
            registrationStatus: { in: ['APPROVED', 'CHECKED_IN', 'COMPLETED', 'PENDING'] },
          },
          select: { userId: true },
        });
        targetUserIds = registrations.map((r) => r.userId);
      }

      // Extract placeholder positions from request payload
      const placeholders = (parsed.data.placeholders as any[]) || [];
      const namePos = placeholders.find((p: any) => p.field === 'studentName') || { x: 50, y: 45 };
      const qrPos = placeholders.find((p: any) => p.field === 'qrCode') || { x: 85, y: 80 };

      const certsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
      if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
      }

      for (const userId of targetUserIds) {
        const studentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, email: true },
        });

        const studentName = studentUser?.fullName || 'Valued Participant';

        const existingCert = await prisma.certificate.findFirst({
          where: { userId, eventId, isDeleted: false },
        });

        const verificationCode = existingCert?.verificationCode || `MCC-CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Render PDF certificate with student name and QR code stamped dynamically
        const { pdfBuffer } = await generateCertificatePdf({
          recipientName: studentName,
          eventTitle: event?.title || 'Microsoft Campus Club Event',
          issueDate: event?.startDate ? new Date(event.startDate).toISOString() : new Date().toISOString(),
          verificationCode,
          certificateType: parsed.data.certificateType,
          backgroundBlobUrl: parsed.data.backgroundBlobUrl,
          namePosition: { x: namePos.x, y: namePos.y },
        });

        const fileName = `${verificationCode}.pdf`;
        const filePath = path.join(certsDir, fileName);
        await fs.promises.writeFile(filePath, pdfBuffer);

        const pdfUrl = `/uploads/certificates/${fileName}`;

        if (existingCert) {
          await prisma.certificate.update({
            where: { id: existingCert.id },
            data: {
              blobUrl: pdfUrl,
              templateId: template.id,
              type: parsed.data.certificateType,
            },
          });
        } else {
          await prisma.certificate.create({
            data: {
              eventId,
              userId,
              templateId: template.id,
              type: parsed.data.certificateType,
              verificationCode,
              blobUrl: pdfUrl,
              emailStatus: 'SENT',
            },
          });
        }
        issuedCount++;
      }
    }

    return ok({ template, issuedCount }, 201);
  } catch (e) {
    console.error('[POST /api/certificates/templates]', e);
    return ERR.INTERNAL();
  }
}
