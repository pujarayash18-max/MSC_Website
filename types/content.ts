// Content Models: Resource, Speaker, TeamMember, Gallery, Blog, Notice, Sponsor, Project (§96-§99, §105)
import { BaseEntity } from './common';

export type ResourceCategory = 
  | 'Slides'
  | 'PDF'
  | 'Assignment'
  | 'Recording'
  | 'Source Code'
  | 'GitHub'
  | 'Microsoft Learn'
  | 'Practice Dataset'
  | 'ZIP'
  | 'Documentation'
  | 'External Link';

export type ResourceVisibility = 
  | 'Public'
  | 'Registered Students'
  | 'Checked-in Students Only'
  | 'Core Team Only'
  | 'Admin Only';

export interface Resource extends BaseEntity {
  resourceId: string;
  eventId: string;
  title: string;
  description: string;
  category: ResourceCategory;
  blobUrl: string;
  visibility: ResourceVisibility;
  uploadedBy: string;
  downloads: number;
  views: number;
  publishTime: string;
  expiryTime?: string;
}

export interface SpeakerSession {
  sessionId: string;
  sessionName: string;
  topic: string;
  time?: string;
  duration?: string;
  room?: string;
  resources?: string[];
  recordingUrl?: string;
  pptUrl?: string;
}

export interface Speaker extends BaseEntity {
  speakerId: string;
  name: string;
  organization: string;
  designation: string;
  bio: string;
  photo: string;
  linkedin?: string;
  website?: string;
  expertise: string[];
  eventIds: string[];
  sessions?: SpeakerSession[];
}

export type TeamCategory = 
  | 'Faculty Coordinators'
  | 'President'
  | 'Vice President'
  | 'Technical Team'
  | 'Events Team'
  | 'Media Team'
  | 'Content Team'
  | 'Design Team'
  | 'Volunteers';

export interface TeamMember extends BaseEntity {
  memberId: string;
  name: string;
  photo: string;
  position: string;
  department: string;
  category: TeamCategory;
  bio: string;
  skills: string[];
  quote?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  portfolio?: string;
  displayOrder: number;
  isFeaturedHomepage: boolean;
}

export interface Album extends BaseEntity {
  albumId: string;
  title: string;
  description?: string;
  coverImage?: string;
  category: 'Workshops' | 'Hackathons' | 'Community Meetups' | 'Behind the Scenes' | 'Conferences';
  eventId?: string;
}

export interface Gallery extends BaseEntity {
  galleryId: string;
  eventId?: string;
  albumId?: string;
  title: string;
  type: 'image' | 'video';
  blobUrl: string;
  thumbnail?: string;
  tags: string[];
  uploadedBy: string;
}

export type BlogStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected';
export type BlogAuthorType = 'Community' | 'CoreTeam';

export interface Blog extends BaseEntity {
  blogId: string;
  title: string;
  slug: string;
  banner: string;
  content: string; // Markdown / Rich Text
  authorId: string;
  authorName: string;
  authorRole?: string;
  authorPhoto?: string;
  category: string;
  tags: string[];
  readingTime?: string;
  readTime?: string;
  publishedAt: string;
  status: BlogStatus;
  authorType: BlogAuthorType;
  rejectionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type NoticePriority = 'General' | 'Event' | 'Urgent' | 'Recruitment' | 'Placement' | 'Microsoft Learn';

export interface Notice extends BaseEntity {
  noticeId: string;
  title: string;
  description: string;
  priority: NoticePriority;
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  isPinned: boolean;
}

export interface Sponsor extends BaseEntity {
  sponsorId: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Silver' | 'Community Partner';
}

export interface Project extends BaseEntity {
  projectId: string;
  title: string;
  description: string;
  thumbnail: string;
  technologies: string[];
  githubRepository?: string;
  liveDemo?: string;
  teamMembers: string[];
  awards?: string[];
}
