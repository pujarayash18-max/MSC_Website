import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, ERR } from '@/lib/api/response';
import { getSession } from '@/lib/auth/jwt';
import { isAdminRole } from '@/lib/constants/roles';

const VALID_TEAM_CATEGORIES: Record<string, string> = {
  FOUNDING_MEMBER: 'FOUNDING_MEMBER',
  FOUNDING: 'FOUNDING_MEMBER',
  'FOUNDING MEMBER': 'FOUNDING_MEMBER',
  FACULTY_COORDINATORS: 'FACULTY_COORDINATORS',
  FACULTY: 'FACULTY_COORDINATORS',
  'FACULTY COORDINATORS': 'FACULTY_COORDINATORS',
  PRESIDENT: 'PRESIDENT',
  VICE_PRESIDENT: 'VICE_PRESIDENT',
  'VICE PRESIDENT': 'VICE_PRESIDENT',
  TECHNICAL_TEAM: 'TECHNICAL_TEAM',
  TECHNICAL: 'TECHNICAL_TEAM',
  CORE_LEAD: 'TECHNICAL_TEAM',
  EVENTS_TEAM: 'EVENTS_TEAM',
  EVENTS: 'EVENTS_TEAM',
  MEDIA_TEAM: 'MEDIA_TEAM',
  MEDIA: 'MEDIA_TEAM',
  CONTENT_TEAM: 'CONTENT_TEAM',
  CONTENT: 'CONTENT_TEAM',
  DESIGN_TEAM: 'DESIGN_TEAM',
  DESIGN: 'DESIGN_TEAM',
  VOLUNTEERS: 'VOLUNTEERS',
  VOLUNTEER: 'VOLUNTEERS',
};

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isDeleted: false, status: 'active' },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
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

    const rawCategory = (category || 'FOUNDING_MEMBER').toString().toUpperCase().replace(/ /g, '_');
    const finalCategory = (VALID_TEAM_CATEGORIES[rawCategory] || 'FOUNDING_MEMBER') as any;

    const member = await prisma.teamMember.create({
      data: {
        name,
        position,
        department: department || 'Computer Engineering',
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        category: finalCategory,
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
