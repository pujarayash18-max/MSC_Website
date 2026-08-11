/**
 * MCC Platform — Prisma Seed Script
 * Seeds realistic data matching lib/services/dataService.ts and authService.ts mock shapes
 * so every page looks identical after migration.
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, SystemRoleName, EventCategory, EventMode, EventStatus,
  RegistrationStatus, AttendanceStatus, CertificateType, CertificateStatus,
  EmailStatus, ResourceCategory, ResourceVisibility, NotificationType,
  WinnerRank, NoticePriority, TicketStatus, AuditStatus, SystemModule,
  TeamCategory, SponsorTier, AlbumCategory, FormType, FieldType, SessionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_AKm1McSBTkR7@ep-steep-pond-aynabyxu.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MCC Platform seed...');

  // ─── Clean existing data (order matters for FK constraints) ──────────────
  await prisma.auditLog.deleteMany();
  await prisma.winnerShowcase.deleteMany();
  await prisma.contactTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.certificateTemplate.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registrationTeamMember.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.team.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.formSection.deleteMany();
  await prisma.registrationForm.deleteMany();
  await prisma.agendaItem.deleteMany();
  await prisma.eventSpeaker.deleteMany();
  await prisma.eventSponsor.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.project.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.event.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.settings.deleteMany();
  console.log('  ✓ Cleaned existing data');

  // ─────────────────────────────────────────
  // ROLES
  // ─────────────────────────────────────────
  const permissionMatrix = {
    'Super Admin': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
      Reports: 'CRUD', 'Audit Logs': 'CRUD', RBAC: 'CRUD', Settings: 'CRUD',
    },
    'Website Admin': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
      Reports: 'CRUD', 'Audit Logs': 'View', RBAC: 'No View', Settings: 'No View',
    },
    'Event Manager': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'View',
      'Team Profiles': 'View', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'No View', Notices: 'CRUD', 'Contact Tickets': 'View',
      Reports: 'View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
    },
    'Content Manager': {
      Dashboard: 'View', Events: 'View', 'Registration Forms': 'View',
      Registrations: 'No View', Attendance: 'No View', 'Event Resources': 'View',
      Certificates: 'No View', Winners: 'View', Leaderboard: 'View',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'View',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'View',
      Reports: 'View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
    },
    'Media Manager': {
      Dashboard: 'View', Events: 'View', 'Registration Forms': 'No View',
      Registrations: 'No View', Attendance: 'No View', 'Event Resources': 'View',
      Certificates: 'No View', Winners: 'View', Leaderboard: 'View',
      'Team Profiles': 'View', 'Speaker Profiles': 'View', Gallery: 'CRUD',
      Blogs: 'No View', Notices: 'No View', 'Contact Tickets': 'No View',
      Reports: 'View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
    },
    'Faculty Coordinator': {
      Dashboard: 'View', Events: 'View', 'Registration Forms': 'View',
      Registrations: 'View', Attendance: 'View', 'Event Resources': 'View',
      Certificates: 'View', Winners: 'View', Leaderboard: 'View',
      'Team Profiles': 'View', 'Speaker Profiles': 'View', Gallery: 'View',
      Blogs: 'View', Notices: 'View', 'Contact Tickets': 'View',
      Reports: 'View', 'Audit Logs': 'View', RBAC: 'No View', Settings: 'No View',
    },
    'President': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
      Reports: 'CRUD', 'Audit Logs': 'View', RBAC: 'No View', Settings: 'No View',
    },
    'Vice President': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
      Reports: 'CRUD', 'Audit Logs': 'View', RBAC: 'No View', Settings: 'No View',
    },
    'Technical Lead': {
      Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
      Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
      Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
      'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
      Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
      Reports: 'CRUD', 'Audit Logs': 'View', RBAC: 'No View', Settings: 'No View',
    },
    'Student': {
      Dashboard: 'View', Events: 'View', 'Registration Forms': 'View',
      Registrations: 'View', Attendance: 'View', 'Event Resources': 'View',
      Certificates: 'View', Winners: 'View', Leaderboard: 'View',
      'Team Profiles': 'View', 'Speaker Profiles': 'View', Gallery: 'View',
      Blogs: 'View', Notices: 'View', 'Contact Tickets': 'View',
      Reports: 'No View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
    },
    'Volunteer': {
      Dashboard: 'View', Events: 'View', 'Registration Forms': 'View',
      Registrations: 'View', Attendance: 'CRUD', 'Event Resources': 'View',
      Certificates: 'View', Winners: 'View', Leaderboard: 'View',
      'Team Profiles': 'View', 'Speaker Profiles': 'View', Gallery: 'View',
      Blogs: 'View', Notices: 'View', 'Contact Tickets': 'View',
      Reports: 'No View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
    },
  };

  const roleNameMap: Record<string, SystemRoleName> = {
    'Super Admin': SystemRoleName.SUPER_ADMIN,
    'Website Admin': SystemRoleName.WEBSITE_ADMIN,
    'Event Manager': SystemRoleName.EVENT_MANAGER,
    'Content Manager': SystemRoleName.CONTENT_MANAGER,
    'Media Manager': SystemRoleName.MEDIA_MANAGER,
    'Faculty Coordinator': SystemRoleName.FACULTY_COORDINATOR,
    'President': SystemRoleName.PRESIDENT,
    'Vice President': SystemRoleName.VICE_PRESIDENT,
    'Technical Lead': SystemRoleName.TECHNICAL_LEAD,
    'Student': SystemRoleName.STUDENT,
    'Volunteer': SystemRoleName.VOLUNTEER,
  };

  const roles = await Promise.all(
    Object.entries(permissionMatrix).map(([name, perms]) =>
      prisma.role.create({
        data: {
          roleName: roleNameMap[name],
          description: `${name} role with predefined permissions`,
          permissions: perms,
        },
      })
    )
  );

  const roleByName = Object.fromEntries(roles.map((r) => [r.roleName, r]));
  console.log(`  ✓ Seeded ${roles.length} roles`);

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const superAdminUser = await prisma.user.create({
    data: {
      id: 'usr_superadmin_001',
      studentId: 'MCC-2026-00042',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@marwadiuniversity.ac.in',
      enrollmentNumber: '92100103045',
      college: 'Marwadi University',
      department: 'Computer Engineering',
      year: '3rd Year',
      division: 'CE-A',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      github: 'rahulsharma-dev',
      linkedin: 'rahulsharma-dev',
      portfolio: 'https://rahulsharma.dev',
      bio: 'Passionate Cloud & Full-Stack Developer | Microsoft Student Ambassador',
      skills: ['TypeScript', 'Next.js', 'Azure Functions', 'Cosmos DB', 'Tailwind CSS'],
      communityPoints: 340,
      currentRank: 1,
      attendancePercentage: 95,
      passwordHash,
      roleName: SystemRoleName.SUPER_ADMIN,
      roleId: roleByName[SystemRoleName.SUPER_ADMIN].id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'usr_admin_002',
      studentId: 'MCC-2026-00043',
      fullName: 'Ananya Verma',
      email: 'ananya.v@marwadiuniversity.ac.in',
      enrollmentNumber: '92100103099',
      college: 'Marwadi University',
      department: 'Information Technology',
      year: '4th Year',
      division: 'IT-B',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      github: 'ananya-verma',
      linkedin: 'ananyaverma-dev',
      portfolio: 'https://ananyaverma.dev',
      bio: 'Website Admin & Cloud Community Lead',
      skills: ['React', 'TypeScript', 'Azure SWA', 'UI/UX Design'],
      communityPoints: 280,
      currentRank: 2,
      attendancePercentage: 92,
      passwordHash,
      roleName: SystemRoleName.WEBSITE_ADMIN,
      roleId: roleByName[SystemRoleName.WEBSITE_ADMIN].id,
    },
  });

  // 5 additional student users
  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        studentId: 'MCC-2026-00101',
        fullName: 'Arjun Patel',
        email: 'arjun.patel@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103101',
        college: 'Marwadi University',
        department: 'Computer Engineering',
        year: '2nd Year',
        division: 'CE-B',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunPatel',
        bio: 'Cloud enthusiast & hackathon participant',
        skills: ['Python', 'Azure', 'Machine Learning'],
        communityPoints: 185,
        currentRank: 3,
        attendancePercentage: 88,
        passwordHash,
        roleName: SystemRoleName.STUDENT,
        roleId: roleByName[SystemRoleName.STUDENT].id,
      },
    }),
    prisma.user.create({
      data: {
        studentId: 'MCC-2026-00102',
        fullName: 'Priya Joshi',
        email: 'priya.joshi@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103102',
        college: 'Marwadi University',
        department: 'Information Technology',
        year: '3rd Year',
        division: 'IT-A',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaJoshi',
        bio: 'Open source contributor | Web Dev',
        skills: ['React', 'Node.js', 'MongoDB'],
        communityPoints: 160,
        currentRank: 4,
        attendancePercentage: 90,
        passwordHash,
        roleName: SystemRoleName.STUDENT,
        roleId: roleByName[SystemRoleName.STUDENT].id,
      },
    }),
    prisma.user.create({
      data: {
        studentId: 'MCC-2026-00103',
        fullName: 'Dev Mehta',
        email: 'dev.mehta@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103103',
        college: 'Marwadi University',
        department: 'Electronics Engineering',
        year: '3rd Year',
        division: 'EC-A',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevMehta',
        bio: 'IoT & Cloud integration developer',
        skills: ['C++', 'Azure IoT', 'Embedded Systems'],
        communityPoints: 120,
        currentRank: 5,
        attendancePercentage: 82,
        passwordHash,
        roleName: SystemRoleName.STUDENT,
        roleId: roleByName[SystemRoleName.STUDENT].id,
      },
    }),
    prisma.user.create({
      data: {
        studentId: 'MCC-2026-00104',
        fullName: 'Sneha Kapoor',
        email: 'sneha.kapoor@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103104',
        college: 'Marwadi University',
        department: 'Computer Engineering',
        year: '1st Year',
        division: 'CE-C',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaKapoor',
        bio: 'First year CS student passionate about AI',
        skills: ['Python', 'Data Science'],
        communityPoints: 80,
        currentRank: 6,
        attendancePercentage: 100,
        passwordHash,
        roleName: SystemRoleName.STUDENT,
        roleId: roleByName[SystemRoleName.STUDENT].id,
      },
    }),
    prisma.user.create({
      data: {
        studentId: 'MCC-2026-00105',
        fullName: 'Karan Shah',
        email: 'karan.shah@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103105',
        college: 'Marwadi University',
        department: 'Computer Engineering',
        year: '4th Year',
        division: 'CE-A',
        profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KaranShah',
        bio: 'Final year dev, Azure certified professional',
        skills: ['Azure DevOps', 'Kubernetes', 'Docker'],
        communityPoints: 210,
        currentRank: 7,
        attendancePercentage: 75,
        passwordHash,
        roleName: SystemRoleName.VOLUNTEER,
        roleId: roleByName[SystemRoleName.VOLUNTEER].id,
      },
    }),
  ]);

  console.log(`  ✓ Seeded ${2 + studentUsers.length} users`);
  const allStudents = [superAdminUser, adminUser, ...studentUsers];

  // ─────────────────────────────────────────
  // SPEAKERS
  // ─────────────────────────────────────────
  const [speaker1, speaker2] = await Promise.all([
    prisma.speaker.create({
      data: {
        id: 'spk_01',
        name: 'Prof. Amit Patel',
        designation: 'Head of Computer Engineering Department',
        organization: 'Marwadi University',
        bio: '20+ years experience in distributed systems, cloud computing, and academic research.',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        website: 'https://marwadiuniversity.ac.in',
        expertise: ['Distributed Systems', 'Cloud Security', 'Academic Excellence'],
      },
    }),
    prisma.speaker.create({
      data: {
        id: 'spk_02',
        name: 'Priya Mehta',
        designation: 'Senior Cloud Solution Architect',
        organization: 'Microsoft India',
        bio: 'Specialist in Azure Cosmos DB NoSQL architecture, serverless microservices, and AI models.',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        linkedin: 'https://linkedin.com',
        website: 'https://microsoft.com',
        expertise: ['Azure Cosmos DB', 'GenAI', 'Serverless'],
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 speakers');

  // ─────────────────────────────────────────
  // SPONSORS
  // ─────────────────────────────────────────
  const [sponsor1, sponsor2] = await Promise.all([
    prisma.sponsor.create({
      data: {
        id: 'spn_01',
        name: 'Microsoft for Startups',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        website: 'https://startups.microsoft.com',
        description: 'Providing Azure credits and technical sponsorship for MCC workshops.',
        tier: SponsorTier.TITLE,
      },
    }),
    prisma.sponsor.create({
      data: {
        id: 'spn_02',
        name: 'GitHub Education',
        logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80',
        website: 'https://education.github.com',
        description: 'Official student developer pack & swag sponsor for national hackathons.',
        tier: SponsorTier.PLATINUM,
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 sponsors');

  // ─────────────────────────────────────────
  // GALLERY ALBUMS (need IDs before events)
  // ─────────────────────────────────────────
  const [album1, album2] = await Promise.all([
    prisma.galleryAlbum.create({
      data: {
        id: 'alb_01',
        title: 'Azure Cloud Masterclass 2026',
        description: 'Highlights from the Azure Cloud Architecture & Serverless Masterclass',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        category: AlbumCategory.WORKSHOPS,
      },
    }),
    prisma.galleryAlbum.create({
      data: {
        id: 'alb_02',
        title: 'National Azure AI Hackathon 2026',
        description: 'The best moments from our flagship hackathon',
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
        category: AlbumCategory.HACKATHONS,
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 gallery albums');

  // ─────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────
  const event1 = await prisma.event.create({
    data: {
      id: 'evt_azure_01',
      title: 'Azure Cloud Architecture & Serverless Masterclass',
      slug: 'azure-cloud-architecture-masterclass',
      shortDescription: 'Hands-on intensive workshop on building serverless microservices with Azure Functions and Cosmos DB.',
      description: 'Join Microsoft Student Ambassadors and industry experts for a 1-day deep dive into modern cloud architecture. Learn Azure Static Web Apps, Cosmos DB, Bicep IAC, and real-time event routing.',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      category: EventCategory.WORKSHOP,
      mode: EventMode.OFFLINE,
      venue: 'Seminar Hall 4, Main Campus, Marwadi University',
      startDate: new Date('2026-08-25T09:30:00.000Z'),
      endDate: new Date('2026-08-25T16:30:00.000Z'),
      registrationStart: new Date('2026-08-01T00:00:00.000Z'),
      registrationEnd: new Date('2026-08-24T23:59:59.000Z'),
      capacity: 150,
      remainingSeats: 18,
      waitlistEnabled: true,
      waitlistLimit: 50,
      waitlistCount: 12,
      registrationStatus: 'Open',
      eventStatus: EventStatus.REGISTRATION_OPEN,
      resourceFolder: 'azure-workshop-2026',
      tags: ['Azure', 'Serverless', 'CosmosDB', 'TypeScript', 'Cloud'],
      galleryAlbumId: album1.id,
      agendaItems: {
        create: [
          { time: '09:30 AM', title: 'Registration & Welcome Keynote', speaker: 'Prof. Amit Patel', room: 'Hall 4', duration: '30 mins', sessionType: SessionType.KEYNOTE, displayOrder: 1 },
          { time: '10:00 AM', title: 'Serverless Functions in Action', speaker: 'Rahul Sharma', room: 'Lab 204', duration: '90 mins', sessionType: SessionType.HANDS_ON, displayOrder: 2 },
          { time: '12:00 PM', title: 'Cosmos DB NoSQL Schema Design', speaker: 'Priya Mehta', room: 'Lab 204', duration: '60 mins', sessionType: SessionType.HANDS_ON, displayOrder: 3 },
          { time: '02:00 PM', title: 'Deploying Azure Static Web Apps', speaker: 'Rahul Sharma', room: 'Lab 204', duration: '120 mins', sessionType: SessionType.HANDS_ON, displayOrder: 4 },
          { time: '04:00 PM', title: 'Q&A, Quiz & Certificate Distribution', speaker: 'Team MCC', room: 'Hall 4', duration: '30 mins', sessionType: SessionType.QUIZ, displayOrder: 5 },
        ],
      },
      speakers: {
        create: [
          { speakerId: speaker1.id },
          { speakerId: speaker2.id },
        ],
      },
      sponsors: {
        create: [{ sponsorId: sponsor1.id }],
      },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      id: 'evt_hack_01',
      title: 'National Azure AI Hackathon 2026',
      slug: 'national-azure-ai-hackathon-2026',
      shortDescription: '36-hour nationwide hackathon building next-gen AI applications with OpenAI & Azure Services.',
      description: 'Compete with 500+ student developers across India. Build innovative generative AI solutions for healthcare, education, sustainability, and fintech with mentorship from Microsoft MVPs.',
      banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      category: EventCategory.HACKATHON,
      mode: EventMode.HYBRID,
      venue: 'Innovation Center & Online (Teams)',
      startDate: new Date('2026-09-15T09:00:00.000Z'),
      endDate: new Date('2026-09-16T21:00:00.000Z'),
      registrationStart: new Date('2026-08-10T00:00:00.000Z'),
      registrationEnd: new Date('2026-09-10T23:59:59.000Z'),
      capacity: 300,
      remainingSeats: 45,
      waitlistEnabled: true,
      waitlistLimit: 100,
      waitlistCount: 28,
      registrationStatus: 'Open',
      eventStatus: EventStatus.REGISTRATION_OPEN,
      resourceFolder: 'hackathon-ai-2026',
      tags: ['AI', 'OpenAI', 'Azure', 'Hackathon', 'Python'],
      galleryAlbumId: album2.id,
      speakers: {
        create: [{ speakerId: speaker1.id }],
      },
      sponsors: {
        create: [
          { sponsorId: sponsor1.id },
          { sponsorId: sponsor2.id },
        ],
      },
    },
  });

  const event3 = await prisma.event.create({
    data: {
      id: 'evt_copilot_01',
      title: 'GitHub Copilot & Open Source Dev Day',
      slug: 'github-copilot-dev-day',
      shortDescription: 'Master AI-assisted software development, automated testing, and open-source contributions.',
      description: 'Learn how to leverage GitHub Copilot, Copilot Workspace, and GitHub Actions to build production-ready applications 3x faster.',
      banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      category: EventCategory.BOOTCAMP,
      mode: EventMode.OFFLINE,
      venue: 'Computer Lab 302, MU Tech Building',
      startDate: new Date('2026-10-05T10:00:00.000Z'),
      endDate: new Date('2026-10-05T16:00:00.000Z'),
      registrationStart: new Date('2026-09-01T00:00:00.000Z'),
      registrationEnd: new Date('2026-10-04T23:59:59.000Z'),
      capacity: 100,
      remainingSeats: 60,
      waitlistEnabled: false,
      waitlistLimit: 0,
      waitlistCount: 0,
      registrationStatus: 'Closed',
      eventStatus: EventStatus.UPCOMING,
      tags: ['GitHub', 'Copilot', 'DevOps', 'CI/CD'],
      speakers: {
        create: [{ speakerId: speaker2.id }],
      },
      sponsors: {
        create: [{ sponsorId: sponsor2.id }],
      },
    },
  });

  console.log('  ✓ Seeded 3 events');

  // ─────────────────────────────────────────
  // REGISTRATION FORMS
  // ─────────────────────────────────────────
  const form1 = await prisma.registrationForm.create({
    data: {
      eventId: event1.id,
      formName: 'Azure Workshop 2026 Registration',
      formType: FormType.COLLEGE_REGISTRATION,
      isEnabled: true,
      displayOrder: 1,
      sections: {
        create: [
          {
            title: 'Personal Information',
            description: 'Your basic profile details',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Full Name', type: FieldType.SHORT_TEXT, required: true, displayOrder: 1 },
                { label: 'Email Address', type: FieldType.EMAIL, required: true, displayOrder: 2 },
                { label: 'Enrollment Number', type: FieldType.ENROLLMENT_NUM, required: true, displayOrder: 3 },
                { label: 'Department', type: FieldType.DEPARTMENT, required: true, displayOrder: 4 },
                { label: 'Year of Study', type: FieldType.YEAR, required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'], displayOrder: 5 },
                { label: 'Phone Number', type: FieldType.PHONE, required: false, displayOrder: 6 },
              ],
            },
          },
          {
            title: 'Technical Background',
            description: 'Tell us about your skills',
            displayOrder: 2,
            fields: {
              create: [
                { label: 'Azure Experience Level', type: FieldType.RADIO, required: true, options: ['Beginner', 'Intermediate', 'Advanced'], displayOrder: 1 },
                { label: 'Programming Languages', type: FieldType.MULTI_SELECT, required: true, options: ['Python', 'TypeScript', 'Java', 'C#', 'Go', 'Other'], displayOrder: 2 },
                { label: 'GitHub Profile', type: FieldType.GITHUB_PROFILE, required: false, displayOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  const form2 = await prisma.registrationForm.create({
    data: {
      eventId: event2.id,
      formName: 'AI Hackathon 2026 Team Registration',
      formType: FormType.HACKATHON_REGISTRATION,
      isEnabled: true,
      displayOrder: 1,
      sections: {
        create: [
          {
            title: 'Team Details',
            description: 'Register your hackathon team',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Team Name', type: FieldType.TEAM_NAME, required: true, displayOrder: 1 },
                { label: 'Team Size', type: FieldType.TEAM_SIZE, required: true, options: ['2', '3', '4'], displayOrder: 2 },
                { label: 'Problem Statement Track', type: FieldType.DROPDOWN, required: true, options: ['Healthcare AI', 'EdTech', 'Sustainability', 'FinTech', 'Open Innovation'], displayOrder: 3 },
                { label: 'Project Idea', type: FieldType.LONG_TEXT, required: true, displayOrder: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  const form3 = await prisma.registrationForm.create({
    data: {
      eventId: event3.id,
      formName: 'GitHub Dev Day Registration',
      formType: FormType.COLLEGE_REGISTRATION,
      isEnabled: true,
      displayOrder: 1,
      sections: {
        create: [
          {
            title: 'Student Details',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Full Name', type: FieldType.SHORT_TEXT, required: true, displayOrder: 1 },
                { label: 'Email', type: FieldType.EMAIL, required: true, displayOrder: 2 },
                { label: 'GitHub Username', type: FieldType.GITHUB_PROFILE, required: true, displayOrder: 3 },
                { label: 'Open Source Contributions', type: FieldType.LONG_TEXT, required: false, placeholder: 'Describe any open source projects you have contributed to', displayOrder: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('  ✓ Seeded 3 registration forms');

  // ─────────────────────────────────────────
  // REGISTRATIONS & ATTENDANCE
  // ─────────────────────────────────────────
  const reg1 = await prisma.registration.create({
    data: {
      eventId: event1.id,
      userId: superAdminUser.id,
      formId: form1.id,
      formType: 'College Registration',
      responses: { 'Full Name': 'Rahul Sharma', 'Email Address': 'rahul.sharma@marwadiuniversity.ac.in', 'Enrollment Number': '92100103045', 'Department': 'Computer Engineering', 'Year of Study': '3rd Year', 'Azure Experience Level': 'Advanced' },
      registrationStatus: RegistrationStatus.APPROVED,
      qrToken: 'MCC-AZ-2026-REG8801-VERIFIED',
      attendanceStatus: AttendanceStatus.PRESENT,
      certificateStatus: CertificateStatus.GENERATED,
      submittedAt: new Date('2026-08-05T10:00:00.000Z'),
    },
  });

  const reg2 = await prisma.registration.create({
    data: {
      eventId: event1.id,
      userId: adminUser.id,
      formId: form1.id,
      formType: 'College Registration',
      responses: { 'Full Name': 'Ananya Verma', 'Email Address': 'ananya.v@marwadiuniversity.ac.in', 'Enrollment Number': '92100103099', 'Department': 'Information Technology', 'Year of Study': '4th Year', 'Azure Experience Level': 'Intermediate' },
      registrationStatus: RegistrationStatus.APPROVED,
      qrToken: 'MCC-AZ-2026-REG8802-VERIFIED',
      attendanceStatus: AttendanceStatus.PRESENT,
      certificateStatus: CertificateStatus.GENERATED,
      submittedAt: new Date('2026-08-06T09:00:00.000Z'),
    },
  });

  const reg3 = await prisma.registration.create({
    data: {
      eventId: event2.id,
      userId: superAdminUser.id,
      formId: form2.id,
      formType: 'Hackathon Registration',
      responses: { 'Team Name': 'Cloud Innovators', 'Team Size': '3', 'Problem Statement Track': 'Healthcare AI', 'Project Idea': 'AI-powered patient appointment scheduling using Azure OpenAI' },
      registrationStatus: RegistrationStatus.APPROVED,
      qrToken: 'MCC-HK-2026-REG9901-VERIFIED',
      attendanceStatus: AttendanceStatus.ABSENT,
      certificateStatus: CertificateStatus.PENDING,
      submittedAt: new Date('2026-08-12T11:00:00.000Z'),
    },
  });

  const reg4 = await prisma.registration.create({
    data: {
      eventId: event2.id,
      userId: studentUsers[0].id,
      formId: form2.id,
      formType: 'Hackathon Registration',
      responses: { 'Team Name': 'Azure Warriors', 'Team Size': '2', 'Problem Statement Track': 'EdTech', 'Project Idea': 'Personalized learning paths using Azure AI' },
      registrationStatus: RegistrationStatus.WAITLISTED,
      qrToken: 'MCC-HK-2026-REG9902-WAITLIST',
      attendanceStatus: AttendanceStatus.ABSENT,
      certificateStatus: CertificateStatus.NOT_ELIGIBLE,
      submittedAt: new Date('2026-08-13T14:00:00.000Z'),
    },
  });

  const reg5 = await prisma.registration.create({
    data: {
      eventId: event3.id,
      userId: studentUsers[1].id,
      formId: form3.id,
      formType: 'College Registration',
      responses: { 'Full Name': 'Priya Joshi', 'Email': 'priya.joshi@marwadiuniversity.ac.in', 'GitHub Username': 'priya-joshi' },
      registrationStatus: RegistrationStatus.PENDING,
      qrToken: 'MCC-CP-2026-REG1001-PENDING',
      attendanceStatus: AttendanceStatus.ABSENT,
      certificateStatus: CertificateStatus.PENDING,
      submittedAt: new Date('2026-09-05T08:00:00.000Z'),
    },
  });

  console.log('  ✓ Seeded 5 registrations');

  // Attendance records for confirmed check-ins
  await Promise.all([
    prisma.attendance.create({
      data: {
        registrationId: reg1.id,
        eventId: event1.id,
        userId: superAdminUser.id,
        checkInTime: new Date('2026-08-25T09:35:00.000Z'),
        checkOutTime: new Date('2026-08-25T16:45:00.000Z'),
        status: AttendanceStatus.PRESENT,
        verifiedBy: adminUser.id,
      },
    }),
    prisma.attendance.create({
      data: {
        registrationId: reg2.id,
        eventId: event1.id,
        userId: adminUser.id,
        checkInTime: new Date('2026-08-25T09:40:00.000Z'),
        status: AttendanceStatus.PRESENT,
        verifiedBy: adminUser.id,
      },
    }),
    prisma.attendance.create({
      data: {
        registrationId: reg3.id,
        eventId: event2.id,
        userId: superAdminUser.id,
        checkInTime: new Date('2026-09-15T09:05:00.000Z'),
        status: AttendanceStatus.LATE,
        verifiedBy: studentUsers[4].id,
      },
    }),
  ]);
  console.log('  ✓ Seeded 3 attendance records');

  // ─────────────────────────────────────────
  // CERTIFICATE TEMPLATES
  // ─────────────────────────────────────────
  const certTemplate = await prisma.certificateTemplate.create({
    data: {
      templateName: 'MCC Standard Participation Certificate 2026',
      certificateType: CertificateType.PARTICIPATION,
      backgroundBlobUrl: 'https://mccdevstorage.blob.core.windows.net/templates/mcc-cert-bg-2026.png',
      placeholders: [
        { fieldName: 'Student Name', x: 50, y: 45, fontSize: 32, fontColor: '#1a1a2e' },
        { fieldName: 'Event Name', x: 50, y: 55, fontSize: 18, fontColor: '#16213e' },
        { fieldName: 'Date', x: 30, y: 75, fontSize: 14, fontColor: '#0f3460' },
        { fieldName: 'Verification ID', x: 70, y: 75, fontSize: 12, fontColor: '#0f3460' },
        { fieldName: 'QR Code', x: 85, y: 80, fontSize: 0, fontColor: '#000000' },
      ],
    },
  });
  console.log('  ✓ Seeded 1 certificate template');

  // ─────────────────────────────────────────
  // CERTIFICATES (matching mock verification IDs)
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.certificate.create({
      data: {
        eventId: event1.id,
        userId: superAdminUser.id,
        templateId: certTemplate.id,
        type: CertificateType.PARTICIPATION,
        verificationCode: 'MCC-CERT-2026-AZ8801',
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-CERT-2026-AZ8801.pdf',
        qrCodeUrl: 'https://mccdevstorage.blob.core.windows.net/qrcodes/MCC-CERT-2026-AZ8801.png',
        generatedAt: new Date('2026-08-25T18:00:00.000Z'),
        emailStatus: EmailStatus.SENT,
      },
    }),
    prisma.certificate.create({
      data: {
        eventId: event2.id,
        userId: adminUser.id,
        templateId: certTemplate.id,
        type: CertificateType.WINNER,
        verificationCode: 'MCC-CERT-2026-HK9902',
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-CERT-2026-HK9902.pdf',
        qrCodeUrl: 'https://mccdevstorage.blob.core.windows.net/qrcodes/MCC-CERT-2026-HK9902.png',
        generatedAt: new Date('2026-09-16T22:00:00.000Z'),
        emailStatus: EmailStatus.SENT,
      },
    }),
    // Legacy verification IDs from dataService.ts
    prisma.certificate.create({
      data: {
        eventId: event1.id,
        userId: superAdminUser.id,
        templateId: certTemplate.id,
        type: CertificateType.PARTICIPATION,
        verificationCode: 'MCC-2026-AZ-98214',
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-2026-AZ-98214.pdf',
        generatedAt: new Date('2026-08-25T18:00:00.000Z'),
        emailStatus: EmailStatus.SENT,
      },
    }),
    prisma.certificate.create({
      data: {
        eventId: event2.id,
        userId: adminUser.id,
        templateId: certTemplate.id,
        type: CertificateType.WINNER,
        verificationCode: 'MCC-2026-AI-44120',
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/certificates/MCC-2026-AI-44120.pdf',
        generatedAt: new Date('2026-09-16T22:00:00.000Z'),
        emailStatus: EmailStatus.SENT,
      },
    }),
  ]);
  console.log('  ✓ Seeded 4 certificates');

  // ─────────────────────────────────────────
  // RESOURCES
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.resource.create({
      data: {
        eventId: event1.id,
        title: 'Azure Functions — Workshop Slides',
        description: 'Complete slide deck from the Azure Functions hands-on session',
        category: ResourceCategory.SLIDES,
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/azure-functions-slides.pdf',
        visibility: ResourceVisibility.REGISTERED_STUDENTS,
        uploadedBy: superAdminUser.id,
        downloads: 45,
        views: 112,
      },
    }),
    prisma.resource.create({
      data: {
        eventId: event1.id,
        title: 'Cosmos DB Schema Design Guide',
        description: 'PDF guide on NoSQL schema design patterns in Cosmos DB',
        category: ResourceCategory.PDF,
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/cosmosdb-schema-guide.pdf',
        visibility: ResourceVisibility.REGISTERED_STUDENTS,
        uploadedBy: superAdminUser.id,
        downloads: 38,
        views: 90,
      },
    }),
    prisma.resource.create({
      data: {
        eventId: event1.id,
        title: 'Workshop Source Code — GitHub',
        description: 'Complete source code for all hands-on exercises',
        category: ResourceCategory.GITHUB,
        blobUrl: 'https://github.com/mcc-marwadi/azure-workshop-2026',
        visibility: ResourceVisibility.PUBLIC,
        uploadedBy: superAdminUser.id,
        downloads: 62,
        views: 155,
      },
    }),
    prisma.resource.create({
      data: {
        eventId: event2.id,
        title: 'Hackathon Problem Statements 2026',
        description: 'Official problem statements for all tracks',
        category: ResourceCategory.PDF,
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/hackathon-problems-2026.pdf',
        visibility: ResourceVisibility.REGISTERED_STUDENTS,
        uploadedBy: adminUser.id,
        downloads: 89,
        views: 200,
      },
    }),
    prisma.resource.create({
      data: {
        eventId: event2.id,
        title: 'Azure OpenAI Starter Template',
        description: 'Boilerplate code for building GenAI apps with Azure OpenAI',
        category: ResourceCategory.SOURCE_CODE,
        blobUrl: 'https://mccdevstorage.blob.core.windows.net/resources/azure-openai-starter.zip',
        visibility: ResourceVisibility.REGISTERED_STUDENTS,
        uploadedBy: adminUser.id,
        downloads: 71,
        views: 180,
      },
    }),
    prisma.resource.create({
      data: {
        eventId: event3.id,
        title: 'GitHub Copilot Getting Started Guide',
        description: 'Step-by-step guide to set up and use GitHub Copilot',
        category: ResourceCategory.DOCUMENTATION,
        blobUrl: 'https://docs.github.com/en/copilot/getting-started-with-github-copilot',
        visibility: ResourceVisibility.PUBLIC,
        uploadedBy: adminUser.id,
        downloads: 15,
        views: 40,
      },
    }),
  ]);
  console.log('  ✓ Seeded 6 resources');

  // ─────────────────────────────────────────
  // POINTS LEDGER
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.pointsLedger.create({ data: { userId: superAdminUser.id, eventId: event1.id, reason: 'Workshop Attendance', points: 15, awardedBy: adminUser.id, awardedAt: new Date('2026-08-25T17:00:00.000Z') } }),
    prisma.pointsLedger.create({ data: { userId: superAdminUser.id, eventId: event2.id, reason: 'Hackathon Winner (1st Place)', points: 100, awardedBy: adminUser.id, awardedAt: new Date('2026-09-16T21:00:00.000Z') } }),
    prisma.pointsLedger.create({ data: { userId: adminUser.id, eventId: event1.id, reason: 'Workshop Attendance', points: 15, awardedBy: superAdminUser.id, awardedAt: new Date('2026-08-25T17:00:00.000Z') } }),
    prisma.pointsLedger.create({ data: { userId: adminUser.id, eventId: event2.id, reason: 'Hackathon Winner (2nd Place)', points: 75, awardedBy: superAdminUser.id, awardedAt: new Date('2026-09-16T21:00:00.000Z') } }),
    prisma.pointsLedger.create({ data: { userId: studentUsers[0].id, eventId: event1.id, reason: 'Event Participation', points: 10, awardedBy: adminUser.id, awardedAt: new Date('2026-08-26T09:00:00.000Z') } }),
  ]);
  console.log('  ✓ Seeded 5 points ledger entries');

  // ─────────────────────────────────────────
  // ACHIEVEMENTS
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.achievement.create({ data: { userId: superAdminUser.id, badge: 'cloud-champion', title: 'Cloud Champion', description: 'Won 1st place in an Azure Hackathon', icon: '🏆', earnedAt: new Date('2026-09-16T21:00:00.000Z') } }),
    prisma.achievement.create({ data: { userId: superAdminUser.id, badge: 'workshop-warrior', title: 'Workshop Warrior', description: 'Attended 5+ workshops', icon: '⚡', earnedAt: new Date('2026-08-25T17:00:00.000Z') } }),
    prisma.achievement.create({ data: { userId: adminUser.id, badge: 'open-source-star', title: 'Open Source Star', description: 'Made 10+ open source contributions', icon: '⭐', earnedAt: new Date('2026-08-15T10:00:00.000Z') } }),
  ]);
  console.log('  ✓ Seeded 3 achievements');

  // ─────────────────────────────────────────
  // FEEDBACK
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.feedback.create({
      data: {
        eventId: event1.id,
        userId: superAdminUser.id,
        rating: 5,
        speakerRating: 5,
        organizationRating: 4,
        venueRating: 4,
        contentQualityRating: 5,
        suggestions: 'More hands-on labs and add an advanced track next time.',
        comments: 'Excellent workshop! The Azure Functions session was incredibly practical.',
        submittedAt: new Date('2026-08-25T17:30:00.000Z'),
      },
    }),
    prisma.feedback.create({
      data: {
        eventId: event1.id,
        userId: adminUser.id,
        rating: 4,
        speakerRating: 4,
        organizationRating: 5,
        venueRating: 5,
        contentQualityRating: 4,
        suggestions: 'Provide pre-reading materials a week before the event.',
        comments: 'Well-organized event. Would love a follow-up advanced session.',
        submittedAt: new Date('2026-08-25T18:00:00.000Z'),
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 feedback records');

  // ─────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────
  const notifData = [
    { userId: superAdminUser.id, title: 'Registration Approved', message: 'Your registration for Azure Cloud Masterclass has been approved.', type: NotificationType.REGISTRATION_APPROVED, link: `/dashboard/registrations/${reg1.id}`, isRead: true },
    { userId: superAdminUser.id, title: 'Certificate Ready', message: 'Your certificate for Azure Cloud Masterclass is ready for download.', type: NotificationType.CERTIFICATE_READY, link: '/dashboard/certificates', isRead: false },
    { userId: superAdminUser.id, title: 'New Blog Post', message: 'Check out: Building GenAI Agents with Azure OpenAI and Cosmos DB', type: NotificationType.NEW_BLOG, link: '/blog/building-genai-agents-with-openai-and-cosmosdb', isRead: false },
    { userId: adminUser.id, title: 'Registration Approved', message: 'Your registration for Azure Cloud Masterclass has been approved.', type: NotificationType.REGISTRATION_APPROVED, link: `/dashboard/registrations/${reg2.id}`, isRead: true },
    { userId: adminUser.id, title: 'Winner Announcement', message: 'Congratulations! You placed 2nd in National Azure AI Hackathon 2026.', type: NotificationType.WINNER_ANNOUNCEMENT, link: '/leaderboard', isRead: false },
    { userId: adminUser.id, title: 'Certificate Ready', message: 'Your Winner certificate for AI Hackathon is ready.', type: NotificationType.CERTIFICATE_READY, link: '/dashboard/certificates', isRead: false },
    { userId: studentUsers[0].id, title: 'Registration Waitlisted', message: 'Your registration for National Azure AI Hackathon 2026 is waitlisted.', type: NotificationType.REGISTRATION_WAITLISTED, link: `/dashboard/registrations/${reg4.id}`, isRead: false },
    { userId: studentUsers[0].id, title: 'New Notice', message: 'MCC Core Team Recruitment 2026-27 Announced!', type: NotificationType.NEW_NOTICE, link: '/#notices', isRead: false },
    { userId: studentUsers[1].id, title: 'Recruitment Open', message: 'Applications are open for MCC Core Team 2026-27. Apply now!', type: NotificationType.RECRUITMENT_OPEN, link: '/join', isRead: false },
  ];
  await prisma.notification.createMany({ data: notifData });
  console.log('  ✓ Seeded 9 notifications');

  // ─────────────────────────────────────────
  // BLOG POSTS
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.blogPost.create({
      data: {
        id: 'blg_azure_01',
        slug: 'getting-started-with-azure-static-web-apps',
        title: 'Getting Started with Azure Static Web Apps and Next.js 16',
        excerpt: 'A comprehensive guide on deploying full-stack Next.js applications to Azure Static Web Apps with serverless functions API backend.',
        content: `# Building Next-Gen Web Applications on Azure\n\nAzure Static Web Apps (SWA) streamlines full-stack web development with automated global CI/CD deployment directly from GitHub.\n\n## Why Choose Azure Static Web Apps?\n\n- **Global CDN Distribution**: Pre-rendered static assets served closer to your users.\n- **Integrated Serverless APIs**: Seamless integration with Azure Functions for backend APIs.\n- **Built-in Custom Domains & SSL**: Free SSL certificates renewed automatically.\n\n## Deploying Your First App\n\nConnecting your GitHub repository triggers GitHub Actions workflow automatically on every push to main branch.`,
        banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        authorId: superAdminUser.id,
        authorName: 'Rahul Sharma',
        authorRole: 'President & Microsoft Student Ambassador',
        authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        category: 'Cloud Architecture',
        tags: ['Azure', 'Next.js', 'Serverless', 'WebDev'],
        readTime: '5 min read',
        publishedAt: new Date('2026-08-01'),
      },
    }),
    prisma.blogPost.create({
      data: {
        id: 'blg_ai_02',
        slug: 'building-genai-agents-with-openai-and-cosmosdb',
        title: 'Building Intelligent GenAI Agents with Azure OpenAI and Cosmos DB',
        excerpt: 'Learn how to leverage Azure Cosmos DB NoSQL vector search alongside Azure OpenAI services to build RAG-powered student assistants.',
        content: `# Empowering Student Communities with Generative AI\n\nGenerative AI is transforming how student developers learn and build applications.\n\n## RAG Architecture Overview\n\nBy embedding document vectors into Cosmos DB, your AI agent can query campus event guidelines and documentation with low latency.`,
        banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
        authorId: adminUser.id,
        authorName: 'Ananya Verma',
        authorRole: 'Vice President & AI Community Lead',
        authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        category: 'Artificial Intelligence',
        tags: ['AI', 'OpenAI', 'CosmosDB', 'Python'],
        readTime: '7 min read',
        publishedAt: new Date('2026-08-05'),
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 blog posts');

  // ─────────────────────────────────────────
  // PROJECTS
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.project.create({
      data: {
        title: 'MCC Event Management Platform',
        description: 'Full-stack Next.js platform for managing Microsoft Campus Club events, registrations, certificates, and the student leaderboard. Built with Azure SWA + Cosmos DB.',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
        technologies: ['Next.js', 'TypeScript', 'Azure Static Web Apps', 'Cosmos DB', 'Prisma', 'Tailwind CSS'],
        githubRepo: 'https://github.com/mcc-marwadi/mcc-platform',
        liveDemo: 'https://mcc.marwadiuniversity.ac.in',
        teamMembers: ['Rahul Sharma', 'Ananya Verma', 'Arjun Patel'],
        awards: ['Best Student Project — Marwadi University 2026'],
      },
    }),
    prisma.project.create({
      data: {
        title: 'Azure IoT Smart Campus Dashboard',
        description: 'Real-time IoT dashboard monitoring campus energy, attendance, and environmental sensors using Azure IoT Hub, Stream Analytics, and Power BI Embedded.',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
        technologies: ['Azure IoT Hub', 'Stream Analytics', 'React', 'Power BI Embedded', 'Python'],
        githubRepo: 'https://github.com/mcc-marwadi/smart-campus',
        teamMembers: ['Dev Mehta', 'Karan Shah'],
        awards: [],
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 projects');

  // ─────────────────────────────────────────
  // GALLERY IMAGES
  // ─────────────────────────────────────────
  await prisma.galleryImage.createMany({
    data: [
      { albumId: album1.id, eventId: event1.id, title: 'Workshop Opening Keynote', type: 'image', blobUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&auto=format&fit=crop&q=80', tags: ['keynote', 'azure', '2026'], uploadedBy: adminUser.id },
      { albumId: album1.id, eventId: event1.id, title: 'Hands-on Lab Session', type: 'image', blobUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80', tags: ['lab', 'hands-on', 'azure'], uploadedBy: adminUser.id },
      { albumId: album2.id, eventId: event2.id, title: 'Hackathon Team Registration', type: 'image', blobUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', tags: ['hackathon', 'registration', '2026'], uploadedBy: superAdminUser.id },
      { albumId: album2.id, eventId: event2.id, title: 'Prize Distribution Ceremony', type: 'image', blobUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80', tags: ['prize', 'ceremony', 'winners'], uploadedBy: superAdminUser.id },
    ],
  });
  console.log('  ✓ Seeded 4 gallery images');

  // ─────────────────────────────────────────
  // TEAM MEMBERS
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.teamMember.create({
      data: {
        id: 'tm_01',
        name: 'Rahul Sharma',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        position: 'President & Microsoft Student Ambassador',
        department: 'Computer Engineering (4th Year)',
        category: TeamCategory.PRESIDENT,
        bio: 'Leading MCC at Marwadi University. Gold Microsoft Learn Student Ambassador & Azure Certified.',
        skills: ['Azure', 'Next.js', 'Leadership', 'TypeScript'],
        quote: 'Empowering students to build world-class cloud solutions.',
        github: 'rahulsharma-mu',
        linkedin: 'rahulsharma-dev',
        displayOrder: 1,
        isFeaturedHomepage: true,
      },
    }),
    prisma.teamMember.create({
      data: {
        id: 'tm_02',
        name: 'Ananya Verma',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        position: 'Vice President',
        department: 'Information Technology (3rd Year)',
        category: TeamCategory.VICE_PRESIDENT,
        bio: 'ML Ambassador & Community Organizer. Spearheading hackathons and open-source bootcamps.',
        skills: ['Python', 'Machine Learning', 'Community Outreach'],
        quote: 'Fostering diversity and innovation in tech.',
        github: 'ananya-verma',
        linkedin: 'ananyaverma',
        displayOrder: 3,
        isFeaturedHomepage: true,
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 team members');

  // ─────────────────────────────────────────
  // NOTICES
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.notice.create({
      data: {
        title: 'Registration Open for Azure Cloud Masterclass',
        description: 'Limited 150 seats available. Register early to receive free Azure pass credits and official certificates.',
        priority: NoticePriority.URGENT,
        publishDate: new Date('2026-08-05T00:00:00.000Z'),
        expiryDate: new Date('2026-08-25T00:00:00.000Z'),
        isPinned: true,
      },
    }),
    prisma.notice.create({
      data: {
        title: 'MCC Core Team Recruitment 2026-27 Announced',
        description: 'Applications are now open for Technical, Media, Content, and Event Management leads. Apply via Join Us tab.',
        priority: NoticePriority.RECRUITMENT,
        publishDate: new Date('2026-08-01T00:00:00.000Z'),
        isPinned: true,
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 notices');

  // ─────────────────────────────────────────
  // CONTACT TICKETS
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.contactTicket.create({
      data: {
        name: 'Rohan Singh',
        email: 'rohan.singh@student.ac.in',
        subject: 'Certificate Not Received',
        message: 'I attended the Azure Workshop on August 25th but have not received my participation certificate yet. My registration ID is MCC-AZ-2026-REG8803.',
        status: TicketStatus.OPEN,
      },
    }),
    prisma.contactTicket.create({
      data: {
        name: 'Nisha Patel',
        email: 'nisha.patel@student.ac.in',
        subject: 'Registration Deadline Extension Request',
        message: 'I was unable to register for the AI Hackathon due to technical issues on the last day. Can the deadline be extended by 24 hours?',
        status: TicketStatus.RESOLVED,
        assignedTo: adminUser.id,
        responseNote: 'Deadline extension has been granted. Please register at the earliest. — MCC Team',
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 contact tickets');

  // ─────────────────────────────────────────
  // WINNER SHOWCASES
  // ─────────────────────────────────────────
  await Promise.all([
    prisma.winnerShowcase.create({
      data: {
        eventId: event2.id,
        userId: superAdminUser.id,
        registrationId: reg3.id,
        studentName: 'Rahul Sharma',
        college: 'Marwadi University',
        teamName: 'Cloud Innovators',
        rank: WinnerRank.FIRST,
        points: 100,
        badge: 'hackathon-champion',
        prize: 'Azure Credits worth ₹50,000 + Microsoft Swag Kit',
        certificateType: 'Winner Certificate (1st Place)',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        published: true,
      },
    }),
    prisma.winnerShowcase.create({
      data: {
        eventId: event2.id,
        userId: adminUser.id,
        registrationId: reg3.id, // same team
        studentName: 'Ananya Verma',
        college: 'Marwadi University',
        teamName: 'Cloud Innovators',
        rank: WinnerRank.FIRST,
        points: 100,
        badge: 'hackathon-champion',
        prize: 'Azure Credits worth ₹50,000 + Microsoft Swag Kit',
        certificateType: 'Winner Certificate (1st Place)',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        published: true,
      },
    }),
  ]);
  console.log('  ✓ Seeded 2 winner showcases');

  // ─────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: superAdminUser.id, userName: 'Rahul Sharma', role: 'Super Admin', action: 'CREATE_EVENT', module: SystemModule.EVENTS, details: 'Created event: Azure Cloud Architecture & Serverless Masterclass', ipAddress: '192.168.1.100', browser: 'Chrome 126', status: AuditStatus.SUCCESS },
      { userId: superAdminUser.id, userName: 'Rahul Sharma', role: 'Super Admin', action: 'GENERATE_CERTIFICATES', module: SystemModule.CERTIFICATES, details: 'Batch generated 132 certificates for evt_azure_01', ipAddress: '192.168.1.100', browser: 'Chrome 126', status: AuditStatus.SUCCESS },
      { userId: adminUser.id, userName: 'Ananya Verma', role: 'Website Admin', action: 'CREATE_BLOG_POST', module: SystemModule.BLOGS, details: 'Published blog: Building GenAI Agents with Azure OpenAI and Cosmos DB', ipAddress: '192.168.1.101', browser: 'Edge 126', status: AuditStatus.SUCCESS },
      { userId: adminUser.id, userName: 'Ananya Verma', role: 'Website Admin', action: 'UPDATE_NOTICE', module: SystemModule.NOTICES, details: 'Updated notice: Registration Open for Azure Cloud Masterclass', ipAddress: '192.168.1.101', browser: 'Edge 126', status: AuditStatus.SUCCESS },
      { userId: superAdminUser.id, userName: 'Rahul Sharma', role: 'Super Admin', action: 'EXPORT_REGISTRATIONS', module: SystemModule.REGISTRATIONS, details: 'Exported registrations CSV for evt_hack_01 (245 rows)', ipAddress: '192.168.1.100', browser: 'Chrome 126', status: AuditStatus.SUCCESS },
    ],
  });
  console.log('  ✓ Seeded 5 audit logs');

  // ─────────────────────────────────────────
  // SETTINGS (singleton)
  // ─────────────────────────────────────────
  await prisma.settings.create({
    data: {
      id: 'global',
      clubName: 'Microsoft Campus Club - Marwadi University',
      logoUrl: '/logo.png',
      theme: 'dark',
      defaultPoints: {
        firstPlace: 100,
        secondPlace: 75,
        thirdPlace: 50,
        finalist: 25,
        participant: 10,
        workshopCheckin: 15,
      },
      limits: {
        maxPerStudentPerMonth: 3,
        maxUploadSizeBytes: 10485760,
      },
      maintenanceMode: false,
      contactEmail: 'mcc@marwadiuniversity.ac.in',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/mcc-marwadi',
        github: 'https://github.com/mcc-marwadi',
        instagram: 'https://instagram.com/mcc_marwadi',
        youtube: 'https://youtube.com/@mccmarwadi',
        discord: 'https://discord.gg/mcc-marwadi',
        microsoftLearn: 'https://learn.microsoft.com/community',
      },
    },
  });
  console.log('  ✓ Seeded settings singleton');

  console.log('\n✅ MCC Platform seed complete!');
  console.log(`   Users:         ${2 + studentUsers.length}`);
  console.log('   Roles:         11');
  console.log('   Events:        3');
  console.log('   Speakers:      2');
  console.log('   Sponsors:      2');
  console.log('   Forms:         3');
  console.log('   Registrations: 5');
  console.log('   Attendance:    3');
  console.log('   Certificates:  4');
  console.log('   Resources:     6');
  console.log('   Points:        5');
  console.log('   Achievements:  3');
  console.log('   Feedback:      2');
  console.log('   Notifications: 9');
  console.log('   Blog Posts:    2');
  console.log('   Projects:      2');
  console.log('   Gallery:       2 albums, 4 images');
  console.log('   Team Members:  2');
  console.log('   Notices:       2');
  console.log('   Tickets:       2');
  console.log('   Winners:       2');
  console.log('   Audit Logs:    5');
  console.log('   Settings:      1 (global)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
