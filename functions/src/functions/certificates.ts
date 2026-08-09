// POST /api/certificates/generate (§122)
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { verifyPermission } from '../lib/auth';
import { successResponse, errorResponse } from '../lib/response';
import { memoryStore } from '../lib/cosmos';
import { Certificate } from '../../../types/system';

export async function certificatesGenerate(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const { authorized } = verifyPermission(request, 'Certificates', 'Create');
  if (!authorized) {
    return errorResponse('Forbidden: Insufficient permissions to generate certificates', 'FORBIDDEN', 403);
  }

  try {
    const body = (await request.json()) as {
      eventId: string;
      eventName: string;
      recipients: Array<{ userId: string; studentName: string }>;
      type: 'Participation' | 'Winner' | 'Volunteer' | 'Speaker' | 'Organizer';
    };

    if (!body.eventId || !body.recipients || body.recipients.length === 0) {
      return errorResponse('Invalid certificate generation payload');
    }

    const generatedCerts: Certificate[] = [];

    for (const r of body.recipients) {
      const certId = `cert_${Date.now()}_${r.userId}`;
      const verificationId = `MCC-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const cert: Certificate = {
        id: certId,
        certificateId: certId,
        eventId: body.eventId,
        eventName: body.eventName,
        userId: r.userId,
        studentName: r.studentName,
        type: body.type || 'Participation',
        verificationId,
        blobUrl: `https://mccdevstorage.blob.core.windows.net/certificates/${verificationId}.pdf`,
        generatedAt: new Date().toISOString(),
        emailStatus: 'Sent',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
      };

      await memoryStore.save('Certificates', cert);
      generatedCerts.push(cert);
    }

    return successResponse({
      count: generatedCerts.length,
      certificates: generatedCerts,
      message: `Batch generated ${generatedCerts.length} certificates for ${body.eventName}`
    });
  } catch {
    return errorResponse('Failed to batch generate certificates');
  }
}

app.http('certificates-generate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'certificates/generate',
  handler: certificatesGenerate
});
