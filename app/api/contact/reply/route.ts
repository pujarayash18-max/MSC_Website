import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { sendTicketReplyToUser } from '@/lib/email';
import { TicketStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ReplySchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  replyMessage: z.string().min(5, 'Reply message must be at least 5 characters'),
  newStatus: z.nativeEnum(TicketStatus).optional().default(TicketStatus.RESOLVED),
});

// POST /api/contact/reply — Admin sends an email response directly to the user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const parsed = ReplySchema.safeParse(body);
    if (!parsed.success) {
      return ERR.VALIDATION(parsed.error.errors[0].message);
    }

    const { ticketId, replyMessage, newStatus } = parsed.data;

    const ticket = await prisma.contactTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return ERR.NOT_FOUND('Support ticket not found.');
    }

    // Send email reply directly to user
    const emailSent = await sendTicketReplyToUser(
      ticket.email,
      ticket.name,
      ticket.subject,
      replyMessage.trim(),
      ticket.id,
      session.fullName || 'MCC Admin Team'
    );

    const updatedNote = ticket.responseNote
      ? `${ticket.responseNote}\n\n[Reply by ${session.fullName} at ${new Date().toLocaleString()}]:\n${replyMessage.trim()}`
      : `[Reply by ${session.fullName} at ${new Date().toLocaleString()}]:\n${replyMessage.trim()}`;

    // Update ticket in database
    const updatedTicket = await prisma.contactTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        assignedTo: session.userId,
        responseNote: updatedNote,
      },
    });

    return ok({
      ticket: updatedTicket,
      emailSent,
      message: `Email reply sent to ${ticket.email}! Ticket marked as ${newStatus}.`,
    });
  } catch (e) {
    console.error('[POST /api/contact/reply]', e);
    return ERR.INTERNAL();
  }
}
