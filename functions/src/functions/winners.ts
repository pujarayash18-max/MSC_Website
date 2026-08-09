// POST /api/winners/publish (§120)
import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { verifyPermission } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import { Winner, Points, Achievement } from '../../../types/engagement';

export async function winnersPublish(request: HttpRequest): Promise<HttpResponseInit> {
  const { authorized } = verifyPermission(request, 'Winners', 'Publish');
  if (!authorized) {
    return errorResponse('Forbidden: Insufficient permissions to publish winners', 'FORBIDDEN', 403);
  }

  try {
    const body = (await request.json()) as {
      eventId: string;
      eventName: string;
      winners: Array<{
        userId: string;
        studentName: string;
        college: string;
        rank: 'First' | 'Second' | 'Third' | 'Participant';
        points: number;
        badge: string;
        prize?: string;
      }>;
    };

    if (!body.eventId || !body.winners || body.winners.length === 0) {
      return errorResponse('Invalid winners payload');
    }

    // Publish Cascade (§77, §120)
    for (const w of body.winners) {
      const winnerId = `win_${Date.now()}_${w.userId}`;
      const winnerRecord: Winner = {
        id: winnerId,
        winnerId,
        eventId: body.eventId,
        eventName: body.eventName,
        registrationId: `reg_${w.userId}`,
        userId: w.userId,
        studentName: w.studentName,
        college: w.college,
        rank: w.rank,
        points: w.points,
        badge: w.badge,
        prize: w.prize,
        published: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
      };
      await memoryStore.save('WinnerAnnouncements', winnerRecord);

      // 1. Credit Community Points Ledger
      const pointRecord: Points = {
        id: `pt_${Date.now()}_${w.userId}`,
        pointId: `pt_${Date.now()}_${w.userId}`,
        userId: w.userId,
        eventId: body.eventId,
        reason: `${w.rank} Place Winner - ${body.eventName}`,
        points: w.points,
        awardedBy: 'System Winner Cascade',
        awardedAt: new Date().toISOString(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      await memoryStore.save('Points', pointRecord);

      // 2. Unlock Achievement Badge
      const achievementRecord: Achievement = {
        id: `ach_${Date.now()}_${w.userId}`,
        achievementId: `ach_${Date.now()}_${w.userId}`,
        userId: w.userId,
        badge: w.badge,
        title: `${w.rank} Place Winner`,
        description: `Awarded for securing ${w.rank} place in ${body.eventName}`,
        icon: 'Trophy',
        earnedAt: new Date().toISOString(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      await memoryStore.save('Achievements', achievementRecord);
    }

    return successResponse({
      published: true,
      message: `Published ${body.winners.length} winners for ${body.eventName}. Cascade complete: Points credited, Badges awarded, Leaderboard updated.`
    });
  } catch {
    return errorResponse('Failed to publish winners cascade');
  }
}

app.http('winners-publish', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'winners/publish',
  handler: winnersPublish
});
