import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export interface CertificateRenderParams {
  recipientName: string;
  eventTitle: string;
  issueDate: string;
  verificationCode: string;
  certificateType: string;
  backgroundBlobUrl?: string;
}

/**
 * Generate a PDF certificate with recipient details and verification QR code.
 */
export async function generateCertificatePdf(params: CertificateRenderParams): Promise<{
  pdfBuffer: Buffer;
  qrBuffer: Buffer;
  qrDataUrl: string;
}> {
  const { recipientName, eventTitle, issueDate, verificationCode, certificateType, backgroundBlobUrl } = params;

  // 1. Generate QR Code image buffer & data URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-certificate/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });
  const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

  // 2. Create PDF document (A4 Landscape: 841.89 x 595.28 points)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Try fetching/embedding background image if provided
  let bgImageEmbedded = false;
  if (backgroundBlobUrl) {
    try {
      if (backgroundBlobUrl.startsWith('http')) {
        const res = await fetch(backgroundBlobUrl);
        if (res.ok) {
          const bgBytes = await res.arrayBuffer();
          const image = backgroundBlobUrl.endsWith('.png')
            ? await pdfDoc.embedPng(bgBytes)
            : await pdfDoc.embedJpg(bgBytes);
          page.drawImage(image, { x: 0, y: 0, width, height });
          bgImageEmbedded = true;
        }
      } else if (backgroundBlobUrl.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), 'public', backgroundBlobUrl);
        if (fs.existsSync(localPath)) {
          const bgBytes = await fs.promises.readFile(localPath);
          const image = localPath.endsWith('.png')
            ? await pdfDoc.embedPng(bgBytes)
            : await pdfDoc.embedJpg(bgBytes);
          page.drawImage(image, { x: 0, y: 0, width, height });
          bgImageEmbedded = true;
        }
      }
    } catch (e) {
      console.warn('[Certificate PDF] Could not embed background image:', e);
    }
  }

  // Draw default elegant border if no background image was embedded
  if (!bgImageEmbedded) {
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0.64, 0.93), // #00A4EF
      borderWidth: 4,
    });
    page.drawRectangle({
      x: 28,
      y: 28,
      width: width - 56,
      height: height - 56,
      borderColor: rgb(0.5, 0.73, 0), // #7FBA00
      borderWidth: 1.5,
    });
  }

  // Embed standard fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header Title
  const headerText = 'MICROSOFT CAMPUS CLUB';
  const headerWidth = fontBold.widthOfTextAtSize(headerText, 24);
  page.drawText(headerText, {
    x: (width - headerWidth) / 2,
    y: height - 80,
    size: 24,
    font: fontBold,
    color: rgb(0, 0.64, 0.93),
  });

  const subtitleText = `CERTIFICATE OF ${certificateType.toUpperCase()}`;
  const subtitleWidth = fontBold.widthOfTextAtSize(subtitleText, 16);
  page.drawText(subtitleText, {
    x: (width - subtitleWidth) / 2,
    y: height - 110,
    size: 16,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  const presentedText = 'This certificate is proudly presented to';
  const presentedWidth = fontRegular.widthOfTextAtSize(presentedText, 12);
  page.drawText(presentedText, {
    x: (width - presentedWidth) / 2,
    y: height - 160,
    size: 12,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Recipient Name
  const nameWidth = fontBold.widthOfTextAtSize(recipientName, 28);
  page.drawText(recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 210,
    size: 28,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  // Event & Achievement details
  const descText = `For outstanding participation and successful completion of ${eventTitle}`;
  const descWidth = fontRegular.widthOfTextAtSize(descText, 13);
  page.drawText(descText, {
    x: (width - descWidth) / 2,
    y: height - 260,
    size: 13,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Footer Metadata
  const dateText = `Date of Issue: ${new Date(issueDate).toLocaleDateString()}`;
  page.drawText(dateText, {
    x: 60,
    y: 80,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  const codeText = `Verification Code: ${verificationCode}`;
  page.drawText(codeText, {
    x: 60,
    y: 60,
    size: 10,
    font: fontBold,
    color: rgb(0, 0.64, 0.93),
  });

  // Embed & Draw QR Code Image
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  page.drawImage(qrImage, {
    x: width - 150,
    y: 50,
    width: 80,
    height: 80,
  });

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    qrBuffer,
    qrDataUrl,
  };
}
