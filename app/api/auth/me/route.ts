import { getSession } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ok, ERR } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();

    const user = await prisma.user.findUnique({
      where: { id: session.userId, isDeleted: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        roleName: true,
        communityPoints: true,
        currentRank: true,
        attendancePercentage: true,
        profilePhoto: true,
        college: true,
        department: true,
        year: true,
        division: true,
        bio: true,
        skills: true,
        github: true,
        linkedin: true,
        portfolio: true,
        enrollmentNumber: true,
        roleId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return ERR.UNAUTHORIZED();
    return ok({ user });
  } catch (e) {
    console.error('[GET /api/auth/me]', e);
    return ERR.INTERNAL();
  }
}
