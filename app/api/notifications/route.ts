import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';

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
