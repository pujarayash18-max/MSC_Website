import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return ERR.UNAUTHORIZED();
    }

    const userEmails = [session.email.trim()];
    if (session.userId) {
      const u = await prisma.user.findUnique({ where: { id: session.userId } });
      if (u?.email && !userEmails.includes(u.email)) {
        userEmails.push(u.email.trim());
      }
    }

    const applications = await prisma.recruitmentApplication.findMany({
      where: {
        isDeleted: false,
        OR: [
          ...(session.userId ? [{ userId: session.userId }] : []),
          ...userEmails.map((em) => ({ email: { equals: em, mode: 'insensitive' as const } })),
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            title: true,
            department: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ applications });
  } catch (e: any) {
    console.error('[GET /api/recruitment/my-applications]', e);
    return err(e?.message || 'Failed to fetch your applications.', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return ERR.UNAUTHORIZED();
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return err('Application ID is required.', 400);
    }

    const existing = await prisma.recruitmentApplication.findFirst({
      where: {
        id,
        isDeleted: false,
        OR: [
          { userId: session.userId },
          { email: session.email },
        ],
      },
    });

    if (!existing) {
      return err('Application not found or access denied.', 444);
    }

    if (existing.status !== 'PENDING') {
      return err('Only pending applications can be withdrawn.', 400);
    }

    await prisma.recruitmentApplication.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok({ message: 'Application withdrawn successfully.' });
  } catch (e: any) {
    console.error('[DELETE /api/recruitment/my-applications]', e);
    return err(e?.message || 'Failed to withdraw application.', 500);
  }
}
