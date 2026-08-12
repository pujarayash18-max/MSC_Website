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
  namePosition?: { x: number; y: number };
  includeQrCode?: boolean;
}

async function getTemplateBytesAndType(url: string): Promise<{ bytes: Buffer; isPdf: boolean; isPng: boolean; isJpg: boolean } | null> {
  try {
    if (url.startsWith('data:application/pdf;base64,')) {
      const base64 = url.replace(/^data:application\/pdf;base64,/, '');
      return { bytes: Buffer.from(base64, 'base64'), isPdf: true, isPng: false, isJpg: false };
    }
    if (url.startsWith('data:image/png;base64,')) {
      const base64 = url.replace(/^data:image\/png;base64,/, '');
      return { bytes: Buffer.from(base64, 'base64'), isPdf: false, isPng: true, isJpg: false };
    }
    if (url.startsWith('data:image/jpeg;base64,') || url.startsWith('data:image/jpg;base64,')) {
      const base64 = url.replace(/^data:image\/j(peg|pg);base64,/, '');
      return { bytes: Buffer.from(base64, 'base64'), isPdf: false, isPng: false, isJpg: true };
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await fetch(url);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        const bytes = Buffer.from(arr);
        const isPdf = url.toLowerCase().split('?')[0].endsWith('.pdf') || bytes.slice(0, 4).toString() === '%PDF';
        const isPng = url.toLowerCase().split('?')[0].endsWith('.png');
        const isJpg = !isPdf && !isPng;
        return { bytes, isPdf, isPng, isJpg };
      }
    }
    if (url.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', url);
      if (fs.existsSync(localPath)) {
        const bytes = await fs.promises.readFile(localPath);
        const isPdf = localPath.toLowerCase().endsWith('.pdf') || bytes.slice(0, 4).toString() === '%PDF';
        const isPng = localPath.toLowerCase().endsWith('.png');
        const isJpg = !isPdf && !isPng;
        return { bytes, isPdf, isPng, isJpg };
      }
    }
  } catch (e) {
    console.warn('[Certificate PDF] Could not read background template:', e);
  }
  return null;
}

/**
 * Generate a high-resolution PDF certificate with recipient details.
 */
export async function generateCertificatePdf(params: CertificateRenderParams): Promise<{
  pdfBuffer: Buffer;
  qrBuffer: Buffer;
  qrDataUrl: string;
}> {
  const {
    recipientName,
    eventTitle,
    issueDate,
    verificationCode,
    certificateType,
    backgroundBlobUrl,
    namePosition,
    includeQrCode = false,
  } = params;

  // Generate QR Code image buffer & data URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-certificate/${verificationCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });
  const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

  // Create PDF document (A4 Landscape: 841.89 x 595.28 points)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Try fetching/embedding background image or PDF template if provided
  let bgImageEmbedded = false;
  if (backgroundBlobUrl && !backgroundBlobUrl.startsWith('data:image/svg+xml')) {
    const templateData = await getTemplateBytesAndType(backgroundBlobUrl);
    if (templateData) {
      try {
        if (templateData.isPdf) {
          const templatePdfDoc = await PDFDocument.load(templateData.bytes);
          const [embeddedPage] = await pdfDoc.embedPdf(templatePdfDoc, [0]);
          page.drawPage(embeddedPage, { x: 0, y: 0, width, height });
          bgImageEmbedded = true;
        } else if (templateData.isPng) {
          const image = await pdfDoc.embedPng(templateData.bytes);
          page.drawImage(image, { x: 0, y: 0, width, height });
          bgImageEmbedded = true;
        } else if (templateData.isJpg) {
          const image = await pdfDoc.embedJpg(templateData.bytes);
          page.drawImage(image, { x: 0, y: 0, width, height });
          bgImageEmbedded = true;
        }
      } catch (e) {
        console.warn('[Certificate PDF] Failed to embed custom background template:', e);
      }
    }
  }

  // Draw default elegant border and header text ONLY if no custom template was embedded
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

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

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

    const descText = `For outstanding participation and successful completion of ${eventTitle}`;
    const descWidth = fontRegular.widthOfTextAtSize(descText, 13);
    page.drawText(descText, {
      x: (width - descWidth) / 2,
      y: height - 260,
      size: 13,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

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
  }

  // Embed standard bold font for Student Name
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Dynamic Student Name Stamping with precise aspect-ratio baseline alignment
  const displayName = recipientName || 'Valued Participant';
  const fontSize = 28;
  const nameWidth = fontBold.widthOfTextAtSize(displayName, fontSize);
  const nameX = namePosition?.x !== undefined ? (namePosition.x / 100) * width - nameWidth / 2 : (width - nameWidth) / 2;
  const nameY = namePosition?.y !== undefined ? height - (namePosition.y / 100) * height - fontSize / 3 : height - 210;

  page.drawText(displayName, {
    x: Math.max(10, Math.min(width - nameWidth - 10, nameX)),
    y: Math.max(10, Math.min(height - 35, nameY)),
    size: fontSize,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.25),
  });

  // Include QR Code ONLY if explicitly requested
  if (includeQrCode) {
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, {
      x: width - 150,
      y: 50,
      width: 80,
      height: 80,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    qrBuffer,
    qrDataUrl,
  };
}
