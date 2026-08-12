import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    const session = await getSession();
    const isAdmin = session && isAdminRole(session.roleName);

    // Non-admins can only see PUBLIC resources
    const visibility = isAdmin ? undefined : { in: ['PUBLIC'] as never[] };

    const resources = await prisma.resource.findMany({
      where: {
        isDeleted: false,
        ...(eventId ? { eventId } : {}),
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

    if (!title || !fileUrl || !eventId) {
      return err('Title, fileUrl, and eventId are required.', 400);
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        category: category || 'SLIDES',
        blobUrl: fileUrl,
        visibility: visibility || 'PUBLIC',
        eventId,
        uploadedBy: session.userId,
      },
    });

    return ok({ resource }, 201);
  } catch (e) {
    console.error('[POST /api/resources]', e);
    return ERR.INTERNAL();
  }
}
