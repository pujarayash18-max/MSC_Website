import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'mcc_azure_timer_cron_secret_key_2026';
    const providedSecret = req.headers.get('x-cron-secret');

    if (providedSecret !== cronSecret) {
      return ERR.UNAUTHORIZED();
    }

    const now = new Date();

    // Find all published/ongoing events whose endDate has passed and status is not COMPLETED
    const expiredEvents = await prisma.event.findMany({
      where: {
        isDeleted: false,
        endDate: { lte: now },
        eventStatus: { not: 'COMPLETED' },
      },
      include: {
        attendances: {
          where: { status: 'PRESENT' },
          include: { user: true },
        },
      },
    });

    if (expiredEvents.length === 0) {
      return ok({ message: 'No pending expired events found.', completedCount: 0 });
    }

    const completedEventIds: string[] = [];
    let feedbackNotificationsDispatched = 0;

    for (const evt of expiredEvents) {
      // Transition event to COMPLETED
      await prisma.event.update({
        where: { id: evt.id },
        data: { eventStatus: 'COMPLETED' },
      });
      completedEventIds.push(evt.id);

      // Notify checked-in attendees to submit feedback
      for (const att of evt.attendances) {
        if (!att.user) continue;

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: att.userId,
            title: `Feedback Requested: ${evt.title}`,
            message: `Thank you for attending "${evt.title}". Please take 1 minute to submit your event feedback!`,
            type: 'LIVE_RESOURCE_AVAILABLE',
            link: `/dashboard/feedback?eventId=${evt.id}`,
          },
        });

        // Send email prompt
        if (att.user.email) {
          sendEmail({
            to: att.user.email,
            subject: `Feedback Requested: ${evt.title} — Microsoft Campus Club`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h2 style="color: #00A4EF; margin-top: 0;">We Value Your Feedback!</h2>
                <p>Hi <strong>${att.user.fullName}</strong>,</p>
                <p>Thank you for participating in <strong>${evt.title}</strong> at Microsoft Campus Club.</p>
                <p>Your insights help us craft better workshops and community meetups. Please click below to share your post-event feedback:</p>
                <p style="text-align: center; margin: 24px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/feedback?eventId=${evt.id}" style="background: #00A4EF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Submit Feedback</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">Microsoft Campus Club • Marwadi University</p>
              </div>
            `,
          }).catch(() => {});
        }
        feedbackNotificationsDispatched++;
      }
    }

    return ok({
      message: `Successfully completed ${completedEventIds.length} expired event(s).`,
      completedEventIds,
      feedbackNotificationsDispatched,
    });
  } catch (e) {
    console.error('[POST /api/events/auto-complete]', e);
    return ERR.INTERNAL();
  }
}

export async function GET(req: NextRequest) {
  // Allow manual trigger verification with secret query param or header
  return POST(req);
}
