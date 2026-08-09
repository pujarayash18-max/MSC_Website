import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import { verifyPermission } from '../lib/auth';

export async function formsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    const formId = url.pathname.split('/').pop();

    if (request.method === 'GET') {
      const allForms = await memoryStore.getAll<Record<string, unknown>>('registrationForms');
      if (eventId) {
        const filtered = allForms.filter((f) => f.eventId === eventId);
        return successResponse(filtered);
      }
      if (formId && formId !== 'forms') {
        const single = await memoryStore.getById<Record<string, unknown>>('registrationForms', formId);
        return single ? successResponse(single) : errorResponse('Form not found', 'NOT_FOUND', 404);
      }
      return successResponse(allForms);
    }

    // Mutating endpoints require Admin/Event Manager permissions (§126)
    const auth = verifyPermission(request, 'Registration Forms', 'Update');
    if (!auth.authorized) {
      return errorResponse('Unauthorized to modify registration forms', 'FORBIDDEN', 403);
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as Record<string, unknown>;
      const newForm = {
        id: `form_${Date.now()}`,
        formId: `form_${Date.now()}`,
        eventId: body.eventId || 'global',
        formName: body.formName || 'Untitled Registration Form',
        formType: body.formType || 'College Registration',
        isEnabled: body.isEnabled ?? true,
        displayOrder: body.displayOrder || 1,
        sections: body.sections || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await memoryStore.save('registrationForms', newForm);
      return successResponse(newForm);
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as Record<string, unknown>;
      if (!body.formId && !body.id) {
        return errorResponse('Form ID is required for update', 'BAD_REQUEST', 400);
      }
      const targetId = (body.formId || body.id) as string;
      const existing = await memoryStore.getById<Record<string, unknown>>('registrationForms', targetId);
      if (!existing) {
        return errorResponse('Form not found', 'NOT_FOUND', 404);
      }
      const updated = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString()
      };
      await memoryStore.save('registrationForms', updated as unknown as { id: string });
      return successResponse(updated);
    }

    if (request.method === 'DELETE') {
      if (!formId || formId === 'forms') {
        return errorResponse('Form ID required', 'BAD_REQUEST', 400);
      }
      await memoryStore.delete('registrationForms', formId);
      return successResponse({ deleted: true, formId });
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Forms operation failed';
    context.error('Error handling forms:', error);
    return errorResponse(msg);
  }
}

app.http('forms', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  handler: formsHandler
});
