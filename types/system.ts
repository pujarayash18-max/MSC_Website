// System Models: Certificate, CertificateTemplate, ContactTicket, NewsletterSubscriber, Settings (§103, §107, §109)
import { BaseEntity } from './common';

export type CertificateType = 'Participation' | 'Winner' | 'Volunteer' | 'Speaker' | 'Organizer';

export interface PlaceholderPosition {
  fieldName: 'Student Name' | 'Event Name' | 'Date' | 'Certificate Type' | 'Verification ID' | 'QR Code';
  x: number; // percentage or px
  y: number; // percentage or px
  fontSize?: number;
  fontColor?: string;
}

export interface CertificateTemplate extends BaseEntity {
  templateId: string;
  templateName: string;
  certificateType: CertificateType;
  backgroundBlobUrl: string;
  placeholders: PlaceholderPosition[];
}

export interface Certificate extends BaseEntity {
  certificateId: string;
  eventId: string;
  eventName: string;
  userId: string;
  studentName: string;
  type: CertificateType;
  verificationId: string;
  blobUrl: string;
  qrCodeUrl?: string;
  generatedAt: string;
  emailStatus: 'Sent' | 'Pending' | 'Failed';
}

export type TicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface ContactTicket extends BaseEntity {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: TicketStatus;
  assignedTo?: string;
  responseNote?: string;
}

export interface NewsletterSubscriber extends BaseEntity {
  subscriberId: string;
  name: string;
  email: string;
  subscribedAt: string;
}

export interface Settings extends BaseEntity {
  clubName: string;
  logoUrl: string;
  theme: 'dark' | 'light' | 'system';
  defaultPoints: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
    finalist: number;
    participant: number;
    workshopCheckin: number;
  };
  registrationLimits: {
    maxPerStudentPerMonth: number;
  };
  storageLimits: {
    maxUploadSizeBytes: number;
  };
  maintenanceMode: boolean;
  contactEmail: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
    microsoftLearn?: string;
  };
}
