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
      const replyTo = process.env.REPLY_TO_EMAIL || 'MCC_Marwadi@outlook.com';
      await smtpTransporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        replyTo,
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
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}`;

  return sendEmail({
    to,
    subject: `Ticket & QR Pass: ${eventTitle} — Microsoft Campus Club`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-b: 2px solid #f1f5f9;">
          <h2 style="color: #00A4EF; margin: 0; font-size: 24px; font-weight: 800;">🎉 Registration Confirmed!</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Microsoft Campus Club • Marwadi University</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 16px;">Dear <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Your seat for <strong>${eventTitle}</strong> has been successfully reserved! Below is your official digital entry pass for event check-in.
          </p>

          <!-- Visual QR Pass Container -->
          <div style="background: #f8fafc; border: 2px dashed #00A4EF; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 14px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Official Check-In QR Pass</p>
            <div style="display: inline-block; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
              <img src="${qrImageUrl}" alt="Event Entry QR Code" width="200" height="200" style="display: block; margin: 0 auto; border-radius: 6px;" />
            </div>
            <p style="margin: 16px 0 0 0; font-size: 15px; font-family: monospace; font-weight: bold; color: #00A4EF;">Pass Token: ${qrToken}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Show this QR code at the desk upon arrival for instant check-in.</p>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            You can also log in to your Student Dashboard anytime to view your live entry pass, team details, and certificates.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Microsoft Campus Club • Department of Computer Engineering • Marwadi University
        </p>
      </div>
    `,
  });
}

export async function sendOnlineMeetingInvitation(
  to: string,
  studentName: string,
  eventTitle: string,
  meetingUrl: string
): Promise<boolean> {
  const safeMeetingUrl = meetingUrl && meetingUrl.startsWith('http')
    ? meetingUrl
    : 'https://teams.microsoft.com';

  return sendEmail({
    to,
    subject: `Online Meeting Invitation: ${eventTitle} — Microsoft Campus Club`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff; color: #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9;">
          <h2 style="color: #00A4EF; margin: 0; font-size: 24px; font-weight: 800;">🎉 Registration Confirmed!</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Microsoft Campus Club • Marwadi University</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 16px;">Dear <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Your registration for <strong>${eventTitle}</strong> is confirmed! Below is your official session invitation link to join the online meeting.
          </p>

          <!-- Visual Meeting Link Container -->
          <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">🌐 Microsoft Teams / Meeting Link</p>
            <p style="margin: 0 0 18px 0; font-size: 13px; color: #475569;">Click the button below at session time to join:</p>
            <a href="${safeMeetingUrl}" target="_blank" style="background: linear-gradient(135deg, #0078D4 0%, #00A4EF 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);">
              Join Online Session Now
            </a>
            <p style="margin: 16px 0 0 0; font-size: 11px; color: #64748b;">
              Direct URL: <a href="${safeMeetingUrl}" style="color: #0078D4;">${safeMeetingUrl}</a>
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #00A4EF;">
            <strong>Note:</strong> As this is an online virtual session, no entry QR code is required. Simply join via the link above.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Microsoft Campus Club • Department of Computer Engineering • Marwadi University
        </p>
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

export async function sendTicketAdminNotification(
  ticketId: string,
  studentName: string,
  studentEmail: string,
  subject: string,
  message: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.TECH_LEAD_EMAIL || 'admin@marwadiuniversity.ac.in';
  return sendEmail({
    to: adminEmail,
    subject: `[NEW SUPPORT TICKET] #${ticketId}: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff; color: #1e293b;">
        <div style="padding-bottom: 16px; border-bottom: 2px solid #f1f5f9;">
          <span style="background: #ef4444; color: #ffffff; text-transform: uppercase; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">New Support Ticket</span>
          <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px; font-weight: 800;">#${ticketId}: ${subject}</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Submitted by <strong>${studentName}</strong> (&lt;${studentEmail}&gt;)</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Ticket Details & Message:</p>
          <div style="background: #f8fafc; border-left: 4px solid #00A4EF; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
            ${message}
          </div>
        </div>

        <div style="text-align: center; padding-top: 12px;">
          <a href="http://localhost:3000/admin/tickets" style="background: #0078D4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
            Open Admin Ticket Console & Reply
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Microsoft Campus Club • Admin Support Ticket System</p>
      </div>
    `,
  });
}

export async function sendTicketReplyToUser(
  to: string,
  studentName: string,
  subject: string,
  replyMessage: string,
  ticketId: string,
  adminName: string = 'MCC Executive Support Team'
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Re: [Ticket #${ticketId}] ${subject} — MCC Support Response`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff; color: #1e293b;">
        <div style="padding-bottom: 16px; border-bottom: 2px solid #00A4EF;">
          <h2 style="color: #0078D4; margin: 0; font-size: 22px; font-weight: 800;">Support Ticket Response</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Ticket ID: <strong>#${ticketId}</strong> | Subject: ${subject}</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px;">Dear <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for reaching out to Microsoft Campus Club. Our admin team has reviewed your ticket:
          </p>

          <div style="background: #f0f9ff; border-left: 4px solid #00A4EF; padding: 18px; border-radius: 12px; margin: 20px 0;">
            <p style="font-size: 11px; font-weight: bold; color: #0078D4; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Admin Reply from ${adminName}:</p>
            <div style="font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">
              ${replyMessage}
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If you have further questions or require additional assistance, feel free to submit another ticket or contact us directly.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Microsoft Campus Club • Department of Computer Engineering • Marwadi University
        </p>
      </div>
    `,
  });
}
