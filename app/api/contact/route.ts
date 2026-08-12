import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

import { sendEmail } from '@/lib/email';

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
});

// Public — anyone can submit a contact ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const ticket = await prisma.contactTicket.create({ data: parsed.data });

    // 1. Student Confirmation Email
    sendEmail({
      to: parsed.data.email,
      subject: `Support Ticket Received: ${parsed.data.subject} — MCC Support`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #00A4EF; margin-top: 0;">Support Ticket Received</h2>
          <p>Hi <strong>${parsed.data.name}</strong>,</p>
          <p>Thank you for reaching out to Microsoft Campus Club Marwadi University. We have logged your support ticket:</p>
          <div style="background: #f8fafc; border-left: 4px solid #00A4EF; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold;">Ticket ID: ${ticket.id}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>Subject:</strong> ${parsed.data.subject}</p>
          </div>
          <p>Our Technical Leads are reviewing your request and will follow up shortly.</p>
        </div>
      `,
    }).catch(() => {});

    // 2. Technical Lead Alert Email
    const techLeadEmail = process.env.TECH_LEAD_EMAIL || 'techlead@marwadiuniversity.ac.in';
    sendEmail({
      to: techLeadEmail,
      subject: `[ALERT] New Support Ticket #${ticket.id}: ${parsed.data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #e11d48; margin-top: 0;">New Support Ticket Submitted</h2>
          <p><strong>From:</strong> ${parsed.data.name} (&lt;${parsed.data.email}&gt;)</p>
          <p><strong>Subject:</strong> ${parsed.data.subject}</p>
          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${parsed.data.message}</p>
          </div>
          <p>Please log in to the Admin Panel to review and assign this ticket.</p>
        </div>
      `,
    }).catch(() => {});

    return ok({ ticket, message: 'Your message has been received. We will get back to you shortly.' }, 201);
  } catch (e) {
    console.error('[POST /api/contact]', e);
    return ERR.INTERNAL();
  }
}
