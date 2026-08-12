import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendEmail, sendTicketAdminNotification } from '@/lib/email';
import { TicketStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const UpdateStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.nativeEnum(TicketStatus),
  assignedTo: z.string().optional(),
});

// GET /api/contact — Admin fetch all support tickets
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const tickets = await prisma.contactTicket.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ tickets });
  } catch (e) {
    console.error('[GET /api/contact]', e);
    return ERR.INTERNAL();
  }
}

// POST /api/contact — PUBLIC Support Ticket submission (No login required!)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const ticket = await prisma.contactTicket.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email.trim().toLowerCase(),
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
        status: TicketStatus.OPEN,
      },
    });

    // 1. Student / User Confirmation Email
    sendEmail({
      to: parsed.data.email.trim().toLowerCase(),
      subject: `[Support Ticket #${ticket.id}] We Received Your Request: ${parsed.data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff; color: #1e293b;">
          <div style="padding-bottom: 16px; border-bottom: 2px solid #00A4EF;">
            <h2 style="color: #00A4EF; margin: 0; font-size: 22px; font-weight: 800;">Support Ticket Received</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Microsoft Campus Club • Marwadi University</p>
          </div>
          <div style="padding: 20px 0;">
            <p>Hi <strong>${parsed.data.name}</strong>,</p>
            <p style="color: #475569; line-height: 1.6;">Thank you for contacting us. We have successfully logged your support ticket:</p>
            <div style="background: #f8fafc; border-left: 4px solid #00A4EF; padding: 16px; margin: 16px 0; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #0078D4;">Ticket Reference ID: #${ticket.id}</p>
              <p style="margin: 6px 0 0 0; font-size: 14px;"><strong>Subject:</strong> ${parsed.data.subject}</p>
            </div>
            <p style="color: #475569; font-size: 13px;">Our executive team will review your query and reply directly to your email address.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Microsoft Campus Club • Department of Computer Engineering</p>
        </div>
      `,
    }).catch((err) => console.warn('[Email Confirmation Fail]', err));

    // 2. Alert Email to Admin
    sendTicketAdminNotification(
      ticket.id,
      parsed.data.name,
      parsed.data.email,
      parsed.data.subject,
      parsed.data.message
    ).catch((err) => console.warn('[Admin Alert Fail]', err));

    return ok(
      {
        ticket,
        message: `Support ticket #${ticket.id} submitted! A confirmation has been sent to ${parsed.data.email}.`,
      },
      201
    );
  } catch (e) {
    console.error('[POST /api/contact]', e);
    return ERR.INTERNAL();
  }
}

// PATCH /api/contact — Admin update ticket status or assignment
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const updated = await prisma.contactTicket.update({
      where: { id: parsed.data.ticketId },
      data: {
        status: parsed.data.status,
        ...(parsed.data.assignedTo ? { assignedTo: parsed.data.assignedTo } : {}),
      },
    });

    return ok({ ticket: updated, message: `Ticket status updated to ${parsed.data.status}` });
  } catch (e) {
    console.error('[PATCH /api/contact]', e);
    return ERR.INTERNAL();
  }
}
