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
          sections: {
            include: { fields: { orderBy: { displayOrder: 'asc' } } },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
      if (!form) return ERR.NOT_FOUND('Registration form');
      return ok({ form });
    }

    if (!eventId) {
      return err('eventId or formId parameter is required.', 400);
    }

    const forms = await prisma.registrationForm.findMany({
      where: { eventId, isDeleted: false },
      include: {
        sections: {
          include: { fields: { orderBy: { displayOrder: 'asc' } } },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return ok({ forms });
  } catch (e) {
    console.error('[GET /api/forms]', e);
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
                type: fld.type || 'SHORT_TEXT',
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
