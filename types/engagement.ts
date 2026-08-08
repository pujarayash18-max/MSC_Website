// Engagement Models: Winner, Points, Achievement, Leaderboard, Feedback, Notification (§100-§104, §106)
import { BaseEntity } from './common';

export type WinnerRank = 'First' | 'Second' | 'Third' | 'Participant';

export interface Winner extends BaseEntity {
  winnerId: string;
  eventId: string;
  eventName: string;
  registrationId: string;
  userId: string;
  studentName: string;
  college: string;
  teamName?: string;
  rank: WinnerRank;
  points: number;
  badge: string;
  prize?: string;
  certificateType?: string;
  photo?: string;
  published: boolean;
}

export interface Points extends BaseEntity {
  pointId: string;
  userId: string;
  eventId?: string;
  reason: string;
  points: number;
  awardedBy: string;
  awardedAt: string;
}

export interface Achievement extends BaseEntity {
  achievementId: string;
  userId: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  college: string;
  department?: string;
  totalPoints: number;
  monthlyPoints?: number;
  semesterPoints?: number;
  academicYearPoints?: number;
  badgesCount: number;
  badges: string[];
  eventsParticipated: number;
  eventsWon: number;
  profilePhoto?: string;
}

export interface Feedback extends BaseEntity {
  feedbackId: string;
  eventId: string;
  eventName: string;
  userId: string;
  studentName: string;
  rating: number; // 1-5
  speakerRating?: number;
  organizationRating?: number;
  venueRating?: number;
  contentQualityRating?: number;
  suggestions?: string;
  comments?: string;
  submittedAt: string;
}

export type NotificationType = 
  | 'Registration Approved'
  | 'Registration Waitlisted'
  | 'Registration Rejected'
  | 'Event Reminder'
  | 'Live Resource Available'
  | 'Certificate Ready'
  | 'Winner Announcement'
  | 'New Blog'
  | 'New Notice'
  | 'Recruitment Open';

export interface Notification extends BaseEntity {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
}
