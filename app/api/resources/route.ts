import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';
import { createAndSendNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/app/api/realtime/route';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    const session = await getSession();
    const isAdmin = session && isAdminRole(session.roleName);

    // Non-admins can see PUBLIC, REGISTERED_STUDENTS, and CHECKED_IN_ONLY resources
    const visibility = isAdmin ? undefined : { in: ['PUBLIC', 'REGISTERED_STUDENTS', 'CHECKED_IN_ONLY'] as never[] };

    const resources = await prisma.resource.findMany({
      where: {
        isDeleted: false,
        ...(eventId && eventId !== 'evt_general' ? { eventId } : {}),
        ...(visibility ? { visibility } : {}),
      },
      include: {
        event: { select: { id: true, title: true } },
      },
      orderBy: { publishTime: 'desc' },
    });

    return ok({ resources });
  } catch (e) {
    console.error('[GET /api/resources]', e);
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
    const { title, description, category, fileUrl, eventId, visibility } = body;

    if (!title || !fileUrl) {
      return err('Title and fileUrl are required.', 400);
    }

    // 1. Resolve eventId & verify foreign key exists in DB
    let targetEventId = eventId;
    let targetEvent = targetEventId ? await prisma.event.findUnique({ where: { id: targetEventId } }) : null;

    if (!targetEvent) {
      targetEvent = await prisma.event.findFirst({ where: { isDeleted: false } });
      if (!targetEvent) {
        // Create fallback general event
        targetEvent = await prisma.event.create({
          data: {
            id: 'evt_general',
            title: 'General MCC Community Resources (All Events)',
            slug: 'general-mcc-resources',
            shortDescription: 'General learning resources and materials for all club members.',
            description: 'General learning resources and materials for all club members.',
            banner: '/images/default-banner.jpg',
            category: 'COMMUNITY_MEETUP',
            mode: 'OFFLINE',
            venue: 'Marwadi University',
            startDate: new Date(),
            endDate: new Date(),
            registrationStart: new Date(),
            registrationEnd: new Date(),
            capacity: 1000,
            remainingSeats: 1000,
          },
        });
      }
      targetEventId = targetEvent.id;
    }

    // 2. Map Category string to Prisma Enum
    const categoryEnumMap: Record<string, any> = {
      'Slides': 'SLIDES',
      'PDF': 'PDF',
      'Assignment': 'ASSIGNMENT',
      'Recording': 'RECORDING',
      'Source Code': 'SOURCE_CODE',
      'GitHub': 'GITHUB',
      'Microsoft Learn': 'MICROSOFT_LEARN',
      'Practice Dataset': 'PRACTICE_DATASET',
      'ZIP': 'ZIP',
      'Documentation': 'DOCUMENTATION',
      'External Link': 'EXTERNAL_LINK'
    };
    const validCategory = categoryEnumMap[category] || String(category || 'SLIDES').toUpperCase().replace(/\s+/g, '_');

    // 3. Map Visibility string to Prisma Enum
    const visibilityEnumMap: Record<string, any> = {
      'Public': 'PUBLIC',
      'All Signed-in Users': 'PUBLIC',
      'Registered Students': 'REGISTERED_STUDENTS',
      'Registered Event Members Only': 'REGISTERED_STUDENTS',
      'Checked-in Students Only': 'CHECKED_IN_ONLY',
      'Core Team & Admins Only': 'ADMIN_ONLY',
      'Admin Only': 'ADMIN_ONLY'
    };
    const validVisibility = visibilityEnumMap[visibility] || String(visibility || 'PUBLIC').toUpperCase().replace(/[\s&]+/g, '_');

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        category: validCategory as any,
        blobUrl: fileUrl,
        visibility: validVisibility as any,
        eventId: targetEventId,
        uploadedBy: session.userId,
      },
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
        title: `New Resource Shared: ${title}`,
        message: `A new ${validCategory.toLowerCase()} resource "${title}" has been shared for ${targetEvent?.title || 'MCC Community'}.`,
        type: 'LIVE_RESOURCE_AVAILABLE',
        link: '/resources',
      }).catch(() => {});
    }

    broadcastEvent('resource_shared', { resourceId: resource.id, title: resource.title });

    return ok({ resource }, 201);
  } catch (e: any) {
    console.error('[POST /api/resources]', e);
    return err(e?.message || 'Failed to publish resource in database.', 500);
  }
}
