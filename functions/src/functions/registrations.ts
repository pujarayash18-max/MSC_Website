import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import QRCode from 'qrcode';

export async function registrationsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    const userId = url.searchParams.get('userId');

    if (request.method === 'GET') {
      const allRegs = await memoryStore.getAll<Record<string, unknown>>('registrations');
      let result = allRegs;
      if (eventId) {
        result = result.filter((r) => r.eventId === eventId);
      }
      if (userId) {
        result = result.filter((r) => r.userId === userId);
      }
      return successResponse(result);
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as {
        eventId: string;
        userId: string;
        formId?: string;
        responses?: Record<string, unknown>;
        email?: string;
        studentName?: string;
      };

      if (!body.eventId || !body.userId) {
        return errorResponse('eventId and userId are required', 'BAD_REQUEST', 400);
      }

      // 1. Duplicate Prevention (§125)
      const existingRegs = await memoryStore.getAll<Record<string, unknown>>('registrations');
      const duplicate = existingRegs.find(
        (r) => r.eventId === body.eventId && r.userId === body.userId && !r.isDeleted
      );
      if (duplicate) {
        return errorResponse('You are already registered for this event.', 'DUPLICATE_REGISTRATION', 409);
      }

      // 2. Capacity & Waitlist Enforcement (§64)
      const events = await memoryStore.getAll<Record<string, unknown>>('events');
      const targetEvent = events.find((e) => e.eventId === body.eventId || e.id === body.eventId);
      
      let registrationStatus = 'Approved';
      let isWaitlisted = false;

      if (targetEvent) {
        const currentCount = existingRegs.filter((r) => r.eventId === body.eventId && r.registrationStatus === 'Approved').length;
        const capacity = (targetEvent.capacity as number) || 100;
        if (currentCount >= capacity) {
          if (targetEvent.waitlistEnabled) {
            registrationStatus = 'Waitlisted';
            isWaitlisted = true;
          } else {
            return errorResponse('Registration is closed. Event maximum capacity reached.', 'CAPACITY_REACHED', 400);
          }
        }
      }

      const regId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      // 3. Secure Verification QR Code Generation (§45, §68)
      const qrPayload = JSON.stringify({
        registrationId: regId,
        eventId: body.eventId,
        userId: body.userId,
        issuedAt: new Date().toISOString()
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });

      const newRegistration = {
        id: regId,
        registrationId: regId,
        eventId: body.eventId,
        userId: body.userId,
        formId: body.formId || 'default',
        responses: body.responses || {},
        registrationStatus,
        attendanceStatus: 'Pending',
        certificateStatus: 'Not Issued',
        qrCode: qrCodeDataUrl,
        isWaitlisted,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await memoryStore.save('registrations', newRegistration);
      return successResponse(newRegistration);
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    context.error('Error handling registrations:', error);
    return errorResponse(msg);
  }
}

app.http('registrations', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: registrationsHandler
});
