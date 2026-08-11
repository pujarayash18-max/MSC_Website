import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { ADMIN_ROLES } from '@/lib/constants/roles';
import type { SystemRoleName } from '@/types';

const CreateEventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  banner: z.string().url(),
  category: z.string(),
  mode: z.string(),
  venue: z.string().min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
  capacity: z.number().int().positive(),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const events = await prisma.event.findMany({
      where: {
        isDeleted: false,
        ...(category ? { category: category as never } : {}),
        ...(status ? { eventStatus: status as never } : {}),
      },
      include: {
        speakers: { include: { speaker: true } },
        sponsors: { include: { sponsor: true } },
        agendaItems: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.event.count({
      where: {
        isDeleted: false,
        ...(category ? { category: category as never } : {}),
        ...(status ? { eventStatus: status as never } : {}),
      },
    });

    return ok({ events, total, limit, offset });
  } catch (e) {
    console.error('[GET /api/events]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!ADMIN_ROLES.includes(session.roleName as SystemRoleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { ...data } = parsed.data;
    const event = await prisma.event.create({
      data: {
        ...data,
        remainingSeats: data.capacity,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        category: data.category as never,
        mode: data.mode as never,
      },
    });

    return ok({ event }, 201);
  } catch (e) {
    console.error('[POST /api/events]', e);
    return ERR.INTERNAL();
  }
}
