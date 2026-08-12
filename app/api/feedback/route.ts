import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

const FeedbackSchema = z.object({
  eventId: z.string().min(1),
  rating: z.number().min(1).max(5),
  speakerRating: z.number().min(1).max(5).optional(),
  organizationRating: z.number().min(1).max(5).optional(),
  venueRating: z.number().min(1).max(5).optional(),
  contentQualityRating: z.number().min(1).max(5).optional(),
  suggestions: z.string().optional(),
  comments: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const isAdmin = isAdminRole(session.roleName);

    const feedbacks = await prisma.feedback.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin ? (eventId ? { eventId } : {}) : { userId: session.userId }),
      },
      include: {
        event: { select: { id: true, title: true, startDate: true } },
        user: { select: { fullName: true, studentId: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return ok({ feedbacks });
  } catch (e) {
    console.error('[GET /api/feedback]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const feedback = await prisma.feedback.create({
      data: {
        ...parsed.data,
        userId: session.userId,
      },
      include: {
        event: { select: { title: true } },
      },
    });

    return ok({ feedback }, 201);
  } catch (e) {
    console.error('[POST /api/feedback]', e);
    return ERR.INTERNAL();
  }
}
