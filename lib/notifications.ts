import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import type { NotificationType } from '@prisma/client';

export async function createAndSendNotification({
  userId,
  userEmail,
  title,
  message,
  type = 'EVENT_REMINDER',
  link,
}: {
  userId: string;
  userEmail?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}): Promise<boolean> {
  try {
    // 1. Create in-app notification record in Database
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });

    // 2. Resolve email if not provided
    let emailToSend = userEmail;
    if (!emailToSend) {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      emailToSend = u?.email;
    }

    // 3. Dispatch Email via Resend / SMTP
    if (emailToSend) {
      sendEmail({
        to: emailToSend,
        subject: `${title} — Microsoft Campus Club`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
            <h2 style="color: #00A4EF; margin-top: 0;">${title}</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">${message}</p>
            ${
              link
                ? `<p style="margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${link}" style="background: #00A4EF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-block;">View Notification</a>
                   </p>`
                : ''
            }
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Microsoft Campus Club • Marwadi University</p>
          </div>
        `,
      }).catch(() => {});
    }

    return true;
  } catch (e) {
    console.error('[createAndSendNotification Error]', e);
    return false;
  }
}
