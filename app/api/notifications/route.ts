import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return ok({ notifications, unreadCount });
  } catch (e) {
    console.error('[GET /api/notifications]', e);
    return ERR.INTERNAL();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
      return ok({ message: 'All notifications marked as read.' });
    }

    if (id) {
      await prisma.notification.update({
        where: { id, userId: session.userId },
        data: { isRead: true },
      });
      return ok({ message: 'Notification marked as read.' });
    }

    return ERR.VALIDATION('Provide id or markAllRead: true');
  } catch (e) {
    console.error('[PATCH /api/notifications]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { title, message, targetAudience, type, link } = body;

    if (!title || !message) {
      return err('title and message are required.', 400);
    }

    // Determine target users
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        status: 'active',
        ...(targetAudience === 'ADMINS'
          ? { roleName: { in: ['SUPER_ADMIN', 'WEBSITE_ADMIN', 'EVENT_MANAGER'] as never[] } }
          : {}),
      },
      select: { id: true, email: true },
    });

    let sentCount = 0;
    for (const u of users) {
      createAndSendNotification({
        userId: u.id,
        userEmail: u.email,
        title,
        message,
        type: type || 'EVENT_REMINDER',
        link,
      }).catch(() => {});
      sentCount++;
    }

    return ok({ message: `Push notification dispatched to ${sentCount} user(s).`, sentCount }, 201);
  } catch (e) {
    console.error('[POST /api/notifications]', e);
    return ERR.INTERNAL();
  }
}
