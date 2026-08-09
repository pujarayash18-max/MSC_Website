import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';

export async function eventsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (request.method === 'GET') {
      const events = await memoryStore.getAll('events');
      return successResponse(events);
    }

    if (request.method === 'POST') {
      const eventData = (await request.json()) as Record<string, unknown>;
      const newEvent = {
        id: `evt_${Date.now()}`,
        eventId: `evt_${Date.now()}`,
        ...eventData,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await memoryStore.save('events', newEvent);
      return successResponse(newEvent);
    }

    return errorResponse('Method not allowed');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Events operation failed';
    context.error('Error handling events:', error);
    return errorResponse(msg);
  }
}

app.http('events', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: eventsHandler
});
