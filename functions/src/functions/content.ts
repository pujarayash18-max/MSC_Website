import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';

export async function contentHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'notices'; // notices, blogs, gallery, feedback, tickets

    if (request.method === 'GET') {
      const items = await memoryStore.getAll<Record<string, unknown>>(type);
      return successResponse(items);
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as Record<string, unknown>;
      const itemId = `${type.slice(0, 3)}_${Date.now()}`;
      const newItem = {
        id: itemId,
        [`${type.slice(0, -1)}Id`]: itemId,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await memoryStore.save(type, newItem);
      return successResponse(newItem);
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Content operation failed';
    context.error('Error handling content:', error);
    return errorResponse(msg);
  }
}

app.http('content', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: contentHandler
});
