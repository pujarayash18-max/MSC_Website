// Data Service with Dynamic Persistence & Storage Sync (§10)
import { Event, Speaker, TeamMember, Notice, Sponsor } from '@/types';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorPhoto: string;
  publishedDate: string;
  readTime: string;
  category: string;
  tags: string[];
  banner: string;
}

export interface CertificateRecord {
  verificationId: string;
  studentName: string;
  studentId: string;
  enrollmentNumber: string;
  eventName: string;
  eventType: string;
  issueDate: string;
  status: 'Verified' | 'Revoked';
  issuer: string;
}

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt_azure_01',
    eventId: 'evt_azure_01',
    title: 'Azure Cloud Architecture & Serverless Masterclass',
    slug: 'azure-cloud-architecture-masterclass',
    shortDescription: 'Hands-on intensive workshop on building serverless microservices with Azure Functions and Cosmos DB.',
    description: 'Join Microsoft Student Ambassadors and industry experts for a 1-day deep dive into modern cloud architecture. Learn Azure Static Web Apps, Cosmos DB, Bicep IAC, and real-time event routing.',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    category: 'Workshop',
    mode: 'Offline',
    venue: 'Seminar Hall 4, Main Campus, Marwadi University',
    startDate: '2026-08-25T09:30:00.000Z',
    endDate: '2026-08-25T16:30:00.000Z',
    registrationStart: '2026-08-01T00:00:00.000Z',
    registrationEnd: '2026-08-24T23:59:59.000Z',
    capacity: 150,
    remainingSeats: 18,
    waitlistEnabled: true,
    waitlistLimit: 50,
    waitlistCount: 12,
    registrationStatus: 'Open',
    eventStatus: 'Registration Open',
    speakerIds: ['spk_01', 'spk_02'],
    coordinatorIds: ['tm_01', 'tm_02'],
    sponsorIds: ['spn_01'],
    resourceFolder: 'azure-workshop-2026',
    galleryAlbumId: 'alb_01',
    tags: ['Azure', 'Serverless', 'CosmosDB', 'TypeScript', 'Cloud'],
    agenda: [
      { id: 'ag_1', time: '09:30 AM', title: 'Registration & Welcome Keynote', speaker: 'Prof. Amit Patel', room: 'Hall 4', duration: '30 mins', sessionType: 'Keynote' },
      { id: 'ag_2', time: '10:00 AM', title: 'Serverless Functions in Action', speaker: 'Rahul Sharma', room: 'Lab 204', duration: '90 mins', sessionType: 'Hands-on' },
      { id: 'ag_3', time: '12:00 PM', title: 'Cosmos DB NoSQL Schema Design', speaker: 'Priya Mehta', room: 'Lab 204', duration: '60 mins', sessionType: 'Hands-on' },
      { id: 'ag_4', time: '02:00 PM', title: 'Deploying Azure Static Web Apps', speaker: 'Rahul Sharma', room: 'Lab 204', duration: '120 mins', sessionType: 'Hands-on' },
      { id: 'ag_5', time: '04:00 PM', title: 'Q&A, Quiz & Certificate Distribution', speaker: 'Team MCC', room: 'Hall 4', duration: '30 mins', sessionType: 'Quiz' }
    ],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'evt_hack_01',
    eventId: 'evt_hack_01',
    title: 'National Azure AI Hackathon 2026',
    slug: 'national-azure-ai-hackathon-2026',
    shortDescription: '36-hour nationwide hackathon building next-gen AI applications with OpenAI & Azure Services.',
    description: 'Compete with 500+ student developers across India. Build innovative generative AI solutions for healthcare, education, sustainability, and fintech with mentorship from Microsoft MVPs.',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    category: 'Hackathon',
    mode: 'Hybrid',
    venue: 'Innovation Center & Online (Teams)',
    startDate: '2026-09-15T09:00:00.000Z',
    endDate: '2026-09-16T21:00:00.000Z',
    registrationStart: '2026-08-10T00:00:00.000Z',
    registrationEnd: '2026-09-10T23:59:59.000Z',
    capacity: 300,
    remainingSeats: 45,
    waitlistEnabled: true,
    waitlistLimit: 100,
    waitlistCount: 28,
    registrationStatus: 'Open',
    eventStatus: 'Registration Open',
    speakerIds: ['spk_01'],
    coordinatorIds: ['tm_01', 'tm_03'],
    sponsorIds: ['spn_01', 'spn_02'],
    resourceFolder: 'hackathon-ai-2026',
    galleryAlbumId: 'alb_02',
    tags: ['AI', 'OpenAI', 'Azure', 'Hackathon', 'Python'],
    agenda: [],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'evt_copilot_01',
    eventId: 'evt_copilot_01',
    title: 'GitHub Copilot & Open Source Dev Day',
    slug: 'github-copilot-dev-day',
    shortDescription: 'Master AI-assisted software development, automated testing, and open-source contributions.',
    description: 'Learn how to leverage GitHub Copilot, Copilot Workspace, and GitHub Actions to build production-ready applications 3x faster.',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    category: 'Bootcamp',
    mode: 'Offline',
    venue: 'Computer Lab 302, MU Tech Building',
    startDate: '2026-10-05T10:00:00.000Z',
    endDate: '2026-10-05T16:00:00.000Z',
    registrationStart: '2026-09-01T00:00:00.000Z',
    registrationEnd: '2026-10-04T23:59:59.000Z',
    capacity: 100,
    remainingSeats: 60,
    waitlistEnabled: false,
    waitlistLimit: 0,
    waitlistCount: 0,
    registrationStatus: 'Closed',
    eventStatus: 'Upcoming',
    speakerIds: ['spk_02'],
    coordinatorIds: ['tm_02'],
    sponsorIds: ['spn_02'],
    tags: ['GitHub', 'Copilot', 'DevOps', 'CI/CD'],
    agenda: [],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  }
];

export const INITIAL_SPEAKERS: Speaker[] = [
  {
    id: 'spk_01',
    speakerId: 'spk_01',
    name: 'Prof. Amit Patel',
    designation: 'Head of Computer Engineering Department',
    organization: 'Marwadi University',
    bio: '20+ years experience in distributed systems, cloud computing, and academic research.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    linkedin: 'https://linkedin.com',
    website: 'https://marwadiuniversity.ac.in',
    expertise: ['Distributed Systems', 'Cloud Security', 'Academic Excellence'],
    eventIds: ['evt_azure_01', 'evt_hack_01'],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'spk_02',
    speakerId: 'spk_02',
    name: 'Priya Mehta',
    designation: 'Senior Cloud Solution Architect',
    organization: 'Microsoft India',
    bio: 'Specialist in Azure Cosmos DB NoSQL architecture, serverless microservices, and AI models.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    linkedin: 'https://linkedin.com',
    website: 'https://microsoft.com',
    expertise: ['Azure Cosmos DB', 'GenAI', 'Serverless'],
    eventIds: ['evt_azure_01', 'evt_copilot_01'],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm_01',
    memberId: 'tm_01',
    name: 'Rahul Sharma',
    position: 'President & Microsoft Student Ambassador',
    department: 'Computer Engineering (4th Year)',
    category: 'President',
    bio: 'Leading MCC at Marwadi University. Gold Microsoft Learn Student Ambassador & Azure Certified.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    skills: ['Azure', 'Next.js', 'Leadership', 'TypeScript'],
    quote: 'Empowering students to build world-class cloud solutions.',
    github: 'rahulsharma-mu',
    linkedin: 'rahulsharma-dev',
    displayOrder: 1,
    isFeaturedHomepage: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'tm_02',
    memberId: 'tm_02',
    name: 'Ananya Verma',
    position: 'Vice President',
    department: 'Information Technology (3rd Year)',
    category: 'Vice President',
    bio: 'ML Ambassador & Community Organizer. Spearheading hackathons and open-source bootcamps.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    skills: ['Python', 'Machine Learning', 'Community Outreach'],
    quote: 'Fostering diversity and innovation in tech.',
    github: 'ananya-verma',
    linkedin: 'ananyaverma',
    displayOrder: 3,
    isFeaturedHomepage: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'ntc_01',
    noticeId: 'ntc_01',
    title: 'Registration Open for Azure Cloud Masterclass',
    description: 'Limited 150 seats available. Register early to receive free Azure pass credits and official certificates.',
    priority: 'Urgent',
    publishDate: '2026-08-05T00:00:00.000Z',
    expiryDate: '2026-08-25T00:00:00.000Z',
    isPinned: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'ntc_02',
    noticeId: 'ntc_02',
    title: 'MCC Core Team Recruitment 2026-27 Announced',
    description: 'Applications are now open for Technical, Media, Content, and Event Management leads. Apply via Join Us tab.',
    priority: 'Recruitment',
    publishDate: '2026-08-01T00:00:00.000Z',
    isPinned: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  }
];

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: 'spn_01',
    sponsorId: 'spn_01',
    name: 'Microsoft for Startups',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    website: 'https://startups.microsoft.com',
    description: 'Providing Azure credits and technical sponsorship for MCC workshops.',
    tier: 'Title',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'spn_02',
    sponsorId: 'spn_02',
    name: 'GitHub Education',
    logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80',
    website: 'https://education.github.com',
    description: 'Official student developer pack & swag sponsor for national hackathons.',
    tier: 'Platinum',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blg_azure_01',
    slug: 'getting-started-with-azure-static-web-apps',
    title: 'Getting Started with Azure Static Web Apps and Next.js 16',
    excerpt: 'A comprehensive guide on deploying full-stack Next.js applications to Azure Static Web Apps with serverless functions API backend.',
    content: `
      # Building Next-Gen Web Applications on Azure

      Azure Static Web Apps (SWA) streamlines full-stack web development with automated global CI/CD deployment directly from GitHub.

      ## Why Choose Azure Static Web Apps?

      - **Global CDN Distribution**: Pre-rendered static assets served closer to your users.
      - **Integrated Serverless APIs**: Seamless integration with Azure Functions for backend APIs.
      - **Built-in Custom Domains & SSL**: Free SSL certificates renewed automatically.

      ## Deploying Your First App

      Connecting your GitHub repository triggers GitHub Actions workflow automatically on every push to main branch.
    `,
    author: 'Rahul Sharma',
    authorRole: 'President & Microsoft Student Ambassador',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    publishedDate: '2026-08-01',
    readTime: '5 min read',
    category: 'Cloud Architecture',
    tags: ['Azure', 'Next.js', 'Serverless', 'WebDev'],
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'blg_ai_02',
    slug: 'building-genai-agents-with-openai-and-cosmosdb',
    title: 'Building Intelligent GenAI Agents with Azure OpenAI and Cosmos DB',
    excerpt: 'Learn how to leverage Azure Cosmos DB NoSQL vector search alongside Azure OpenAI services to build RAG-powered student assistants.',
    content: `
      # Empowering Student Communities with Generative AI

      Generative AI is transforming how student developers learn and build applications.

      ## RAG Architecture Overview

      By embedding document vectors into Cosmos DB, your AI agent can query campus event guidelines and documentation with low latency.
    `,
    author: 'Ananya Verma',
    authorRole: 'Vice President & AI Community Lead',
    authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    publishedDate: '2026-08-05',
    readTime: '7 min read',
    category: 'Artificial Intelligence',
    tags: ['AI', 'OpenAI', 'CosmosDB', 'Python'],
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    verificationId: 'MCC-CERT-2026-AZ8801',
    studentName: 'Rahul Sharma',
    studentId: 'MCC-2026-00042',
    enrollmentNumber: '92100103045',
    eventName: 'Azure Cloud Architecture & Serverless Masterclass',
    eventType: 'Certificate of Participation',
    issueDate: '2026-08-25',
    status: 'Verified',
    issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
  },
  {
    verificationId: 'MCC-CERT-2026-HK9902',
    studentName: 'Rahul Sharma',
    studentId: 'MCC-2026-00042',
    enrollmentNumber: '92100103045',
    eventName: 'National Azure AI Hackathon 2026',
    eventType: 'Winner Certificate (1st Place)',
    issueDate: '2026-08-16',
    status: 'Verified',
    issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
  },
  {
    verificationId: 'CERT-2026-AZ-001',
    studentName: 'Rahul Sharma',
    studentId: 'MCC-2026-00042',
    enrollmentNumber: '92100103045',
    eventName: 'Azure Cloud Architecture Masterclass',
    eventType: 'Certificate of Excellence',
    issueDate: '2026-08-20',
    status: 'Verified',
    issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
  },
  {
    verificationId: 'MCC-2026-AZ-98214',
    studentName: 'Rahul Sharma',
    studentId: 'MCC-2026-00042',
    enrollmentNumber: '92100103045',
    eventName: 'Azure Cloud Architecture & Serverless Masterclass',
    eventType: 'Certificate of Excellence',
    issueDate: '2026-08-25',
    status: 'Verified',
    issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
  },
  {
    verificationId: 'MCC-2026-AI-44120',
    studentName: 'Ananya Verma',
    studentId: 'MCC-2026-00043',
    enrollmentNumber: '92100103099',
    eventName: 'National Azure AI Hackathon 2026',
    eventType: 'Winner Certificate (1st Place)',
    issueDate: '2026-09-16',
    status: 'Verified',
    issuer: 'Microsoft Campus Club (MCC) — Marwadi University'
  }
];

// --- DYNAMIC DATABASE PERSISTENCE ENGINE (§7, §10) ---

const STORAGE_KEYS = {
  EVENTS: 'mcc_db_events',
  REGISTRATIONS: 'mcc_db_registrations',
  ATTENDANCE: 'mcc_db_attendance',
  NOTICES: 'mcc_db_notices',
  FEEDBACK: 'mcc_db_feedback'
};

export const dynamicDb = {
  getEvents(): Event[] {
    if (typeof window === 'undefined') return INITIAL_EVENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    try {
      return JSON.parse(stored) as Event[];
    } catch {
      return INITIAL_EVENTS;
    }
  },

  saveEvent(event: Event): void {
    const current = this.getEvents();
    const idx = current.findIndex((e) => e.eventId === event.eventId || e.id === event.id);
    let updated: Event[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...event, updatedAt: new Date().toISOString() };
    } else {
      updated = [event, ...current];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    }
  },

  getRegistrations(): Record<string, unknown>[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return stored ? JSON.parse(stored) : [];
  },

  saveRegistration(reg: Record<string, unknown>): void {
    const current = this.getRegistrations();
    const updated = [reg, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated));
    }
  },

  getNotices(): Notice[] {
    if (typeof window === 'undefined') return INITIAL_NOTICES;
    const stored = localStorage.getItem(STORAGE_KEYS.NOTICES);
    return stored ? JSON.parse(stored) : INITIAL_NOTICES;
  },

  saveNotice(notice: Notice): void {
    const current = this.getNotices();
    const updated = [notice, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
    }
  }
};
