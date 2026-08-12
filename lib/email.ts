import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const smtpTransporter =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Microsoft Campus Club <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  // Option A: Resend SDK (if key provided and valid)
  if (resend && resendApiKey && resendApiKey.startsWith('re_') && resendApiKey.length > 20) {
    try {
      const replyTo = process.env.REPLY_TO_EMAIL || 'mcc_marwadi@outlook.com';
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        replyTo,
      });
      if (!error) return true;
      console.warn('[Resend Error Fallback to SMTP/Dev]', error);
    } catch (e) {
      console.warn('[Resend Exception Fallback to SMTP/Dev]', e);
    }
  }

  // Option B: Nodemailer SMTP (Outlook / Gmail / University SMTP)
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      return true;
    } catch (e) {
      console.error('[SMTP Error]', e);
      return false;
    }
  }

  // Fallback: Dev log output
  console.log(`\n================ [DEV EMAIL DISPATCH] ================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:\n${html}`);
  console.log(`=======================================================\n`);
  return true;
}

export async function sendRegistrationConfirmation(
  to: string,
  studentName: string,
  eventTitle: string,
  qrToken: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Registration Confirmed: ${eventTitle} — Microsoft Campus Club`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #00A4EF; margin-top: 0;">Registration Confirmed!</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your seat for <strong>${eventTitle}</strong> at Microsoft Campus Club has been successfully reserved.</p>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Your Digital Entry Pass Code</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-family: monospace; font-weight: bold; color: #00A4EF;">${qrToken}</p>
        </div>
        <p>Please log in to your Student Dashboard to view and present your digital QR entry pass during event check-in.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Microsoft Campus Club • Marwadi University</p>
      </div>
    `,
  });
}

export async function sendCertificateIssued(
  to: string,
  studentName: string,
  eventTitle: string,
  downloadUrl: string,
  verificationCode: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Official Certificate Issued: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #7FBA00; margin-top: 0;">Congratulations ${studentName}!</h2>
        <p>Your official certified credential for <strong>${eventTitle}</strong> has been generated.</p>
        <p><strong>Verification Code:</strong> <code>${verificationCode}</code></p>
        <p style="margin-top: 20px;">
          <a href="${downloadUrl}" style="background: #00A4EF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-block;">Download Official PDF Certificate</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Microsoft Campus Club Credentials System</p>
      </div>
    `,
  });
}

export async function sendBlogApproved(
  to: string,
  authorName: string,
  blogTitle: string,
  blogUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Article Published: ${blogTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #00A4EF; margin-top: 0;">Article Approved &amp; Published!</h2>
        <p>Dear <strong>${authorName}</strong>,</p>
        <p>Great news! Your technical article <strong>"${blogTitle}"</strong> has been approved by the Executive Board and is now published on the MCC Engineering Blog.</p>
        <p style="margin-top: 20px;">
          <a href="${blogUrl}" style="background: #7FBA00; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-block;">View Published Article</a>
        </p>
      </div>
    `,
  });
}

export async function sendBlogRejected(
  to: string,
  authorName: string,
  blogTitle: string,
  rejectionNote: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Article Revision Needed: ${blogTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #e11d48; margin-top: 0;">Submission Revision Needed</h2>
        <p>Dear <strong>${authorName}</strong>,</p>
        <p>Thank you for submitting <strong>"${blogTitle}"</strong>. The reviewers have requested revisions before publication:</p>
        <blockquote style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; font-style: italic; color: #9f1239;">
          ${rejectionNote || 'Please review code formatting and add further architectural details.'}
        </blockquote>
        <p>You can edit and resubmit your article directly from your Student Dashboard.</p>
      </div>
    `,
  });
}

export async function sendPasswordReset(
  to: string,
  studentName: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Reset Your MCC Platform Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
        <h2 style="color: #00A4EF; margin-top: 0;">Password Recovery</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>We received a request to reset the password for your Microsoft Campus Club account.</p>
        <p style="margin-top: 20px;">
          <a href="${resetUrl}" style="background: #00A4EF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset My Password</a>
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This link is valid for 1 hour. If you did not request this, you can safely ignore this message.</p>
      </div>
    `,
  });
}
