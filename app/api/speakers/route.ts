import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

const SpeakerSchema = z.object({
  name: z.string().min(2),
  organization: z.string().min(2),
  designation: z.string().min(2),
  bio: z.string().min(10),
  photo: z.string().url(),
  linkedin: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  expertise: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    const speakers = await prisma.speaker.findMany({
      where: { isDeleted: false, status: 'active' },
      include: {
        events: {
          include: {
            event: { select: { id: true, title: true, slug: true, startDate: true, banner: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return ok({ speakers });
  } catch (e) {
    console.error('[GET /api/speakers]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = SpeakerSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const speaker = await prisma.speaker.create({
      data: parsed.data
    });
    return ok({ speaker }, 201);
  } catch (e) {
    console.error('[POST /api/speakers]', e);
    return ERR.INTERNAL();
  }
}
