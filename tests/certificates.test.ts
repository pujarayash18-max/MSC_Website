import { describe, it, expect } from 'vitest';
import { generateCertificatePdf } from '@/lib/certificates';

describe('Certificate Generation Engine', () => {
  it('should render a valid PDF certificate buffer and QR code', async () => {
    const result = await generateCertificatePdf({
      recipientName: 'Rahul Sharma',
      eventTitle: 'Azure Cloud & DevOps Bootcamp',
      issueDate: '2026-08-15',
      verificationCode: 'MCC-TEST-VERIFY-1234',
      certificateType: 'PARTICIPATION',
    });

    expect(result.pdfBuffer).toBeInstanceOf(Buffer);
    expect(result.pdfBuffer.length).toBeGreaterThan(500);

    // Verify PDF header magic bytes (%PDF)
    const header = result.pdfBuffer.toString('utf8', 0, 4);
    expect(header).toBe('%PDF');

    expect(result.qrDataUrl).toContain('data:image/png;base64');
    expect(result.qrBuffer).toBeInstanceOf(Buffer);
  });
});
