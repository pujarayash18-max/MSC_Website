import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

const CreateEventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  shortDescription: z.string().min(5),
  description: z.string().min(10).optional().default('Hands-on technical workshop hosted by Microsoft Campus Club.'),
  banner: z.string().optional().default('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'),
  category: z.string().optional().default('WORKSHOP'),
  mode: z.string().optional().default('OFFLINE'),
  venue: z.string().min(2).optional().default('Seminar Hall 4, Main Campus'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationStart: z.string().optional(),
  registrationEnd: z.string().optional(),
  capacity: z.number().int().positive().optional().default(150),
  tags: z.array(z.string()).optional().default(['Microsoft', 'Cloud', 'Azure']),
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
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { ...data } = parsed.data;
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
    const categoryEnum = data.category.toUpperCase().replace(/\s+/g, '_');
    const modeEnum = data.mode.toUpperCase().replace(/\s+/g, '_');

    const startDate = data.startDate ? new Date(data.startDate) : new Date(Date.now() + 86400000 * 7);
    const endDate = data.endDate ? new Date(data.endDate) : new Date(startDate.getTime() + 14400000);
    const registrationStart = data.registrationStart ? new Date(data.registrationStart) : new Date();
    const registrationEnd = data.registrationEnd ? new Date(data.registrationEnd) : new Date(startDate.getTime() - 3600000);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        banner: data.banner,
        category: categoryEnum as never,
        mode: modeEnum as never,
        venue: data.venue,
        startDate,
        endDate,
        registrationStart,
        registrationEnd,
        capacity: data.capacity,
        remainingSeats: data.capacity,
        tags: data.tags,
        eventStatus: 'REGISTRATION_OPEN',
      },
    });

    return ok({ event }, 201);
  } catch (e) {
    console.error('[POST /api/events]', e);
    return ERR.INTERNAL();
  }
}
