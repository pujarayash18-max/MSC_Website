import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/jwt';
import { ok, err, ERR } from '@/lib/api/response';
import { isAdminRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');
    const formId = searchParams.get('formId');

    if (formId) {
      const form = await prisma.registrationForm.findFirst({
        where: { id: formId, isDeleted: false },
        include: {
          event: { select: { id: true, title: true, slug: true } },
          sections: {
            include: { fields: { orderBy: { displayOrder: 'asc' } } },
            orderBy: { displayOrder: 'asc' },
          },
          _count: { select: { registrations: true } },
        },
      });
      if (!form) return ERR.NOT_FOUND('Registration form');
      return ok({ form });
    }

    const whereClause = eventId
      ? {
          isDeleted: false,
          OR: [
            { eventId },
            { event: { id: eventId } },
            { event: { slug: eventId } },
          ],
        }
      : { isDeleted: false };

    const forms = await prisma.registrationForm.findMany({
      where: whereClause,
      include: {
        event: { select: { id: true, title: true, slug: true } },
        sections: {
          include: { fields: { orderBy: { displayOrder: 'asc' } } },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ forms });
  } catch (e) {
    console.error('[GET /api/forms]', e);
    return ERR.INTERNAL();
  }
}

const FIELD_TYPE_MAP: Record<string, string> = {
  SHORT_TEXT: 'SHORT_TEXT',
  LONG_TEXT: 'LONG_TEXT',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  ENROLLMENT_NUM: 'ENROLLMENT_NUM',
  ENROLLMENT_NUMBER: 'ENROLLMENT_NUM',
  COLLEGE_NAME: 'COLLEGE_NAME',
  DEPARTMENT: 'DEPARTMENT',
  YEAR: 'YEAR',
  DIVISION: 'DIVISION',
  TEAM_NAME: 'TEAM_NAME',
  TEAM_MEMBERS: 'TEAM_MEMBERS',
  TEAM_SIZE: 'TEAM_SIZE',
  DROPDOWN: 'DROPDOWN',
  RADIO: 'RADIO',
  CHECKBOX: 'CHECKBOX',
  MULTI_SELECT: 'MULTI_SELECT',
  DATE: 'DATE',
  TIME: 'TIME',
  NUMBER: 'NUMBER',
  URL: 'URL',
  GITHUB_PROFILE: 'GITHUB_PROFILE',
  LINKEDIN_PROFILE: 'LINKEDIN_PROFILE',
  PORTFOLIO: 'PORTFOLIO',
  RESUME_UPLOAD: 'RESUME_UPLOAD',
  IMAGE_UPLOAD: 'IMAGE_UPLOAD',
  FILE_UPLOAD: 'FILE_UPLOAD',
};

function normalizeFieldType(rawType: string): any {
  if (!rawType) return 'SHORT_TEXT';
  const clean = rawType.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
  if (clean === 'ENROLLMENT_NUMBER' || clean === 'ENROLLMENT_NUM') return 'ENROLLMENT_NUM';
  return FIELD_TYPE_MAP[clean] || 'SHORT_TEXT';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const body = await req.json();
    const { eventId, formName, formType, sections } = body;

    if (!eventId || !formName) {
      return err('eventId and formName are required.', 400);
    }

    // Create or update registration form with sections and fields
    const form = await prisma.registrationForm.create({
      data: {
        eventId,
        formName,
        formType: formType || 'CUSTOM_REGISTRATION',
        sections: {
          create: (sections || []).map((sec: any, secIdx: number) => ({
            title: sec.title || 'General Information',
            description: sec.description || '',
            displayOrder: secIdx,
            fields: {
              create: (sec.fields || []).map((fld: any, fldIdx: number) => ({
                label: fld.label,
                placeholder: fld.placeholder || '',
                type: normalizeFieldType(fld.type),
                required: Boolean(fld.required),
                options: fld.options || [],
                helpText: fld.helpText || null,
                displayOrder: fldIdx,
              })),
            },
          })),
        },
      },
      include: {
        sections: { include: { fields: true } },
      },
    });

    return ok({ form }, 201);
  } catch (e) {
    console.error('[POST /api/forms]', e);
    return ERR.INTERNAL();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.roleName)) {
      return ERR.FORBIDDEN();
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) return err('Form ID is required.', 400);

    await prisma.registrationForm.update({
      where: { id },
      data: { isDeleted: true },
    });

    return ok({ message: 'Form deleted successfully.' });
  } catch (e) {
    console.error('[DELETE /api/forms]', e);
    return ERR.INTERNAL();
  }
}
