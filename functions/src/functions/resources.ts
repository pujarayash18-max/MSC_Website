import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import { verifyPermission } from '../lib/auth';

export async function resourcesHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    const userId = url.searchParams.get('userId');
    const userRole = url.searchParams.get('userRole') || 'Student';

    if (request.method === 'GET') {
      const allResources = await memoryStore.getAll<Record<string, unknown>>('resources');
      let filtered = allResources;

      if (eventId) {
        filtered = filtered.filter((r) => r.eventId === eventId);
      }

      // Check student registration / attendance for tiered visibility (§48, §71)
      let isRegistered = false;
      let isCheckedIn = false;

      if (userId && eventId) {
        const regs = await memoryStore.getAll<Record<string, unknown>>('registrations');
        const userReg = regs.find((r) => r.eventId === eventId && r.userId === userId && !r.isDeleted);
        if (userReg) {
          isRegistered = true;
          if (userReg.attendanceStatus === 'Present' || userReg.attendanceStatus === 'Checked In') {
            isCheckedIn = true;
          }
        }
      }

      const isStaff = ['Super Admin', 'Website Admin', 'Event Manager', 'Core Team', 'Technical Lead'].includes(userRole);

      // Filter by Visibility Tiers (§48)
      const allowed = filtered.filter((res) => {
        const vis = (res.visibility as string) || 'Public';
        if (vis === 'Public') return true;
        if (isStaff) return true;
        if (vis === 'Registered Students' && (isRegistered || isCheckedIn)) return true;
        if (vis === 'Checked-in Students Only' && isCheckedIn) return true;
        return false;
      });

      return successResponse(allowed);
    }

    // Mutating resource endpoints (§118)
    const auth = verifyPermission(request, 'Event Resources', 'Create');
    if (!auth.authorized) {
      return errorResponse('Unauthorized to upload event resources', 'FORBIDDEN', 403);
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as {
        eventId: string;
        title: string;
        description?: string;
        category?: string;
        blobUrl?: string;
        visibility?: string;
        uploadedBy?: string;
      };

      if (!body.eventId || !body.title) {
        return errorResponse('eventId and title are required', 'BAD_REQUEST', 400);
      }

      const resourceId = `res_${Date.now()}`;
      const newResource = {
        id: resourceId,
        resourceId,
        eventId: body.eventId,
        title: body.title,
        description: body.description || '',
        category: body.category || 'PDF',
        blobUrl: body.blobUrl || 'https://blob.core.windows.net/resources/placeholder.pdf',
        visibility: body.visibility || 'Registered Students',
        uploadedBy: body.uploadedBy || 'Admin',
        downloads: 0,
        views: 0,
        createdAt: new Date().toISOString()
      };

      await memoryStore.save('resources', newResource);
      return successResponse(newResource);
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Resources operation failed';
    context.error('Error handling resources:', error);
    return errorResponse(msg);
  }
}

app.http('resources', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: resourcesHandler
});
