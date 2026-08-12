import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { broadcastEvent } from '@/app/api/realtime/route';
import { createAndSendNotification } from '@/lib/notifications';
import { NoticePriority } from '@prisma/client';

// Maps frontend string → Prisma enum key
const PRIORITY_MAP: Record<string, NoticePriority> = {
  General: NoticePriority.GENERAL,
  Event: NoticePriority.EVENT,
  Urgent: NoticePriority.URGENT,
  Recruitment: NoticePriority.RECRUITMENT,
  Placement: NoticePriority.PLACEMENT,
  'Microsoft Learn': NoticePriority.MICROSOFT_LEARN,
};

const NoticeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.string().default('General'),
  isPinned: z.boolean().optional().default(false),
  status: z.string().optional().default('active'),
});

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        isDeleted: false,
        status: 'active',
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
      },
      orderBy: [{ isPinned: 'desc' }, { publishDate: 'desc' }],
    });
    return ok({ notices });
  } catch (e) {
    console.error('[GET /api/notices]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = NoticeSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const { priority: priorityStr, ...rest } = parsed.data;
    const priority = PRIORITY_MAP[priorityStr] ?? NoticePriority.GENERAL;

    const notice = await prisma.notice.create({
      data: { ...rest, priority },
    });

    // Notify active community members
    const activeStudents = await prisma.user.findMany({
      where: { isDeleted: false, status: 'active' },
      select: { id: true, email: true },
    });

    for (const student of activeStudents) {
      createAndSendNotification({
        userId: student.id,
        userEmail: student.email,
        title: `Official Notice: ${notice.title}`,
        message: notice.description,
        type: 'NEW_NOTICE',
        link: '/notices',
      }).catch(() => {});
    }

    broadcastEvent('notice_published', { notice });
    return ok({ notice }, 201);
  } catch (e) {
    console.error('[POST /api/notices]', e);
    return ERR.INTERNAL();
  }
}
