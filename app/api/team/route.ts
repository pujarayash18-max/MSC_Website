import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isDeleted: false, status: 'active' },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });
    return ok({ members });
  } catch (e) {
    console.error('[GET /api/team]', e);
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
    const { name, position, department, photo, category, github, linkedin, email, bio } = body;

    if (!name || !position) {
      return err('Name and position are required.', 400);
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        position,
        department: department || 'Computer Engineering',
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        category: category || 'CORE_LEAD',
        bio: bio || `${position} at Marwadi Club Connect`,
        github: github || null,
        linkedin: linkedin || null,
        email: email || null,
        status: 'active',
      },
    });

    return ok({ member }, 201);
  } catch (e) {
    console.error('[POST /api/team]', e);
    return ERR.INTERNAL();
  }
}
