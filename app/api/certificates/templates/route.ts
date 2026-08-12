import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

const TemplateSchema = z.object({
  templateName: z.string().min(2),
  certificateType: z.enum(['PARTICIPATION', 'WINNER', 'VOLUNTEER', 'SPEAKER', 'ORGANIZER']),
  backgroundBlobUrl: z.string().url(),
  placeholders: z.any().default([]),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const templates = await prisma.certificateTemplate.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ templates });
  } catch (e) {
    console.error('[GET /api/certificates/templates]', e);
    return ERR.INTERNAL();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return ERR.UNAUTHORIZED();
    if (!isAdminRole(session.roleName)) return ERR.FORBIDDEN();

    const body = await req.json();
    const parsed = TemplateSchema.safeParse(body);
    if (!parsed.success) return ERR.VALIDATION(parsed.error.errors[0].message);

    const template = await prisma.certificateTemplate.create({
      data: {
        templateName: parsed.data.templateName,
        certificateType: parsed.data.certificateType,
        backgroundBlobUrl: parsed.data.backgroundBlobUrl,
        placeholders: parsed.data.placeholders ?? [],
      },
    });

    return ok({ template }, 201);
  } catch (e) {
    console.error('[POST /api/certificates/templates]', e);
    return ERR.INTERNAL();
  }
}
