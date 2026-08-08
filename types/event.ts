// Event, Dynamic Form, Registration, Team & Attendance Models (§63, §64, §91-§95)
import { BaseEntity } from './common';

export type EventCategory = 
  | 'Workshop'
  | 'Hackathon'
  | 'Webinar'
  | 'Bootcamp'
  | 'Azure'
  | 'AI'
  | 'GitHub'
  | 'Community Meetup'
  | 'Conference';

export type EventMode = 'Online' | 'Offline' | 'Hybrid';

export type EventStatus = 
  | 'Draft'
  | 'Published'
  | 'Registration Open'
  | 'Registration Closed'
  | 'Upcoming'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  room?: string;
  duration?: string;
  sessionType?: 'Presentation' | 'Hands-on' | 'Quiz' | 'Keynote' | 'Breakout' | 'Networking';
}

export interface Event extends BaseEntity {
  eventId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  banner: string;
  category: EventCategory;
  mode: EventMode;
  venue: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  registrationStart: string; // ISO string
  registrationEnd: string; // ISO string
  capacity: number;
  remainingSeats: number;
  waitlistEnabled: boolean;
  waitlistLimit: number;
  waitlistCount?: number;
  registrationStatus: 'Open' | 'Closed' | 'Waitlist';
  eventStatus: EventStatus;
  speakerIds: string[];
  coordinatorIds: string[];
  sponsorIds: string[];
  resourceFolder?: string;
  galleryAlbumId?: string;
  agenda?: AgendaItem[];
  tags: string[];
}

export type FieldType = 
  | 'Short Text'
  | 'Long Text'
  | 'Email'
  | 'Phone'
  | 'Enrollment Number'
  | 'College Name'
  | 'Department'
  | 'Year'
  | 'Division'
  | 'Team Name'
  | 'Team Members'
  | 'Team Size'
  | 'Dropdown'
  | 'Radio'
  | 'Checkbox'
  | 'Multi-select'
  | 'Date'
  | 'Time'
  | 'Number'
  | 'URL'
  | 'GitHub Profile'
  | 'LinkedIn Profile'
  | 'Portfolio'
  | 'Resume Upload'
  | 'Image Upload'
  | 'File Upload';

export interface FormField {
  fieldId: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  displayOrder: number;
  helpText?: string;
  validationRegex?: string;
  validationErrorMessage?: string;
  visibilityRule?: string;
}

export interface FormSection {
  sectionId: string;
  title: string;
  description?: string;
  displayOrder: number;
  fields: FormField[];
}

export interface RegistrationForm extends BaseEntity {
  formId: string;
  eventId: string;
  formName: string;
  formType: 'College Registration' | 'Inter-College Registration' | 'Hackathon Registration' | 'Custom Registration';
  isEnabled: boolean;
  displayOrder: number;
  sections: FormSection[];
}

export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Waitlisted' | 'Checked In' | 'Completed';
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';
export type CertificateStatus = 'Pending' | 'Generated' | 'Sent' | 'Failed' | 'Not Eligible';

export interface Registration extends BaseEntity {
  registrationId: string;
  eventId: string;
  userId: string;
  formId: string;
  formType: string;
  responses: Record<string, unknown>; // fieldId -> answer
  registrationStatus: RegistrationStatus;
  qrCode: string;
  attendanceStatus: AttendanceStatus;
  certificateStatus: CertificateStatus;
  submittedAt: string;
  teamId?: string;
  notes?: string;
}

export interface Team extends BaseEntity {
  teamId: string;
  eventId: string;
  teamName: string;
  leaderId: string;
  members: Array<{
    userId: string;
    fullName: string;
    email: string;
    role?: string;
  }>;
  repository?: string;
  problemStatement?: string;
  track?: string;
  submissionStatus?: 'Draft' | 'Submitted' | 'Under Review' | 'Evaluated';
  finalResult?: string;
}

export interface Attendance extends BaseEntity {
  attendanceId: string;
  eventId: string;
  registrationId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  verifiedBy: string; // Volunteer / Admin user ID
}
