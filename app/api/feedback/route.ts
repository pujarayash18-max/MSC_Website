import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FEEDBACK_POINTS = 5;

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

    // ── Duplicate check: one feedback per user per event ──
    const existing = await prisma.feedback.findFirst({
      where: { userId: session.userId, eventId: parsed.data.eventId, isDeleted: false },
    });
    if (existing) {
      return ERR.VALIDATION('You have already submitted feedback for this event.');
    }

    // ── Atomic transaction: save feedback + award 5 points + log ──
    const [feedback, updatedUser] = await prisma.$transaction([
      // 1. Create the feedback record
      prisma.feedback.create({
        data: { ...parsed.data, userId: session.userId },
        include: { event: { select: { title: true } } },
      }),
      // 2. Increment user community points by 5
      prisma.user.update({
        where: { id: session.userId },
        data: { communityPoints: { increment: FEEDBACK_POINTS } },
        select: { id: true, fullName: true, communityPoints: true },
      }),
      // 3. Log transaction in PointsLedger
      prisma.pointsLedger.create({
        data: {
          userId: session.userId,
          points: FEEDBACK_POINTS,
          reason: `Event feedback submitted`,
          awardedBy: session.userId, // self-awarded (system action)
          eventId: parsed.data.eventId,
        },
      }),
    ]);

    // ── Real-time broadcast so leaderboard updates instantly ──
    broadcastEvent('leaderboard_updated', {
      userId: updatedUser.id,
      newPoints: updatedUser.communityPoints,
    });

    return ok({
      feedback,
      pointsAwarded: FEEDBACK_POINTS,
      totalPoints: updatedUser.communityPoints,
      message: `+${FEEDBACK_POINTS} points added to your leaderboard score!`,
    }, 201);
  } catch (e) {
    console.error('[POST /api/feedback]', e);
    return ERR.INTERNAL();
  }
}
