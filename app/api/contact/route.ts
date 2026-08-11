import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

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
    return ok({ ticket, message: 'Your message has been received. We will get back to you shortly.' }, 201);
  } catch (e) {
    console.error('[POST /api/contact]', e);
    return ERR.INTERNAL();
  }
}
