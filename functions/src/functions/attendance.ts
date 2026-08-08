// POST /api/attendance/checkin (§117)
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import { Attendance } from '../../../types/event';

export async function attendanceCheckin(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as { qrToken: string; eventId: string; verifiedBy?: string };

    if (!body.qrToken || !body.eventId) {
      return errorResponse('Missing required qrToken or eventId');
    }

    // Duplicate Scan Guard (§46, §125)
    const existing = await memoryStore.query<Attendance>('Attendance', (item) => item.registrationId === body.qrToken);
    if (existing.length > 0) {
      return errorResponse('Duplicate scan detected! Student attendance already marked.', 'DUPLICATE_SCAN', 400);
    }

    const newRecord: Attendance = {
      id: `att_${Date.now()}`,
      attendanceId: `att_${Date.now()}`,
      eventId: body.eventId,
      registrationId: body.qrToken,
      userId: 'usr_dev_001',
      checkInTime: new Date().toISOString(),
      status: 'Present',
      verifiedBy: body.verifiedBy || 'volunteer_01',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await memoryStore.save('Attendance', newRecord);

    return successResponse({
      verified: true,
      checkInTime: newRecord.checkInTime,
      attendance: newRecord,
      message: 'Attendance successfully verified and recorded.'
    });
  } catch (err) {
    return errorResponse('Failed to process attendance check-in');
  }
}

app.http('attendance-checkin', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'attendance/checkin',
  handler: attendanceCheckin
});
