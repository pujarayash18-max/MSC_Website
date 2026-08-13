import { PrismaClient, SystemRoleName, EventCategory, EventMode, EventStatus, FormType, FieldType, NoticePriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanAndSeed() {
  console.log('🧹 Cleaning mock data from database...');

  // Order matters due to foreign key constraints
  await prisma.winnerShowcase.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.contactTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.certificate.deleteMany();
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
  await prisma.event.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.recruitmentApplication.deleteMany();
  await prisma.recruitmentRole.deleteMany();

  console.log('  ✓ Cleaned all mock events, registrations, tickets, notifications, winners, and media.');

  // 1. Ensure System Roles exist
  const superAdminRole = await prisma.role.upsert({
    where: { roleName: SystemRoleName.SUPER_ADMIN },
    update: {},
    create: {
      roleName: SystemRoleName.SUPER_ADMIN,
      description: 'Full system control and administrative access across all modules.',
      permissions: {
        Dashboard: 'CRUD', Events: 'CRUD', 'Registration Forms': 'CRUD',
        Registrations: 'CRUD', Attendance: 'CRUD', 'Event Resources': 'CRUD',
        Certificates: 'CRUD', Winners: 'CRUD', Leaderboard: 'CRUD',
        'Team Profiles': 'CRUD', 'Speaker Profiles': 'CRUD', Gallery: 'CRUD',
        Blogs: 'CRUD', Notices: 'CRUD', 'Contact Tickets': 'CRUD',
        Reports: 'CRUD', 'Audit Logs': 'CRUD', RBAC: 'CRUD', Settings: 'CRUD',
      },
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { roleName: SystemRoleName.STUDENT },
    update: {},
    create: {
      roleName: SystemRoleName.STUDENT,
      description: 'Default student member role.',
      permissions: {
        Dashboard: 'View', Events: 'View', 'Registration Forms': 'View',
        Registrations: 'View', Attendance: 'View', 'Event Resources': 'View',
        Certificates: 'View', Winners: 'View', Leaderboard: 'View',
        'Team Profiles': 'View', 'Speaker Profiles': 'View', Gallery: 'View',
        Blogs: 'View', Notices: 'View', 'Contact Tickets': 'View',
        Reports: 'No View', 'Audit Logs': 'No View', RBAC: 'No View', Settings: 'No View',
      },
    },
  });

  // 2. Ensure Admin & Student Users exist
  const passwordHash = await bcrypt.hash('Password@123', 10);

  let adminUser = await prisma.user.findUnique({ where: { email: 'pujarayash18@gmail.com' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        studentId: `MCC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: 'Yash Pujara',
        email: 'pujarayash18@gmail.com',
        enrollmentNumber: '92100103001',
        college: 'Marwadi University',
        department: 'Computer Engineering',
        year: '4th Year',
        passwordHash,
        roleId: superAdminRole.id,
        roleName: SystemRoleName.SUPER_ADMIN,
        communityPoints: 0,
        currentRank: 1,
      },
    });
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { communityPoints: 0, currentRank: 1, roleId: superAdminRole.id, roleName: SystemRoleName.SUPER_ADMIN },
    });
  }

  let studentUser = await prisma.user.findUnique({ where: { email: 'student@marwadiuniversity.ac.in' } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        studentId: `MCC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: 'Rahul Sharma',
        email: 'student@marwadiuniversity.ac.in',
        enrollmentNumber: '92100103045',
        college: 'Marwadi University',
        department: 'Information Technology',
        year: '3rd Year',
        passwordHash,
        roleId: studentRole.id,
        roleName: SystemRoleName.STUDENT,
        communityPoints: 0,
        currentRank: 2,
      },
    });
  } else {
    studentUser = await prisma.user.update({
      where: { id: studentUser.id },
      data: { communityPoints: 0, currentRank: 2 },
    });
  }

  console.log('  ✓ Verified system roles and primary admin/student accounts.');

  // 3. Seed Speakers (Tisha & Om)
  const speakerTisha = await prisma.speaker.create({
    data: {
      name: 'Tisha',
      organization: 'Microsoft / Marwadi University',
      designation: 'Microsoft Learn Student Ambassador',
      bio: 'Beta Microsoft Learn Student Ambassador leading technical community initiatives and student empowerment roadmaps.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    },
  });

  const speakerOm = await prisma.speaker.create({
    data: {
      name: 'Om',
      organization: 'Microsoft Campus Club',
      designation: 'Technical Core Lead',
      bio: 'Core technical lead at Microsoft Campus Club specializing in developer tools, hands-on workshops, and community learning.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    },
  });

  console.log('  ✓ Created Speakers: Tisha & Om');

  // 4. Seed the 3 Authentic Events
  console.log('📅 Seeding authentic events based on provided schedule...');

  // ── EVENT 1: Student Ambassador Roadmap (17 Aug 2026) ───────────────────
  const event1 = await prisma.event.create({
    data: {
      id: 'evt_roadmap_aug17',
      title: 'Student Ambassador Roadmap',
      slug: 'student-ambassador-roadmap',
      shortDescription: 'How to Become a Student Ambassador / Roadmap session with Tisha.',
      description: 'Join us online for an interactive guidance session on "How to Become a Student Ambassador / Roadmap". Speaker Tisha will walk you through the application steps, milestone progression, exclusive Azure perks, and global networking opportunities offered by the Microsoft Learn Student Ambassador (MLSA) program.',
      banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200',
      category: EventCategory.COMMUNITY_MEETUP,
      mode: EventMode.ONLINE,
      venue: 'Online - Microsoft Teams',
      startDate: new Date('2026-08-17T17:00:00.000Z'), // 5:00 PM IST
      endDate: new Date('2026-08-17T19:00:00.000Z'),   // 7:00 PM IST
      registrationStart: new Date('2026-08-12T00:00:00.000Z'),
      registrationEnd: new Date('2026-08-17T16:00:00.000Z'),
      capacity: 500,
      remainingSeats: 500,
      eventStatus: EventStatus.PUBLISHED,
      status: 'published',
      agendaItems: {
        create: [
          { time: '5:00 PM', title: 'Welcome & Introduction to MLSA', description: 'Overview of Microsoft Learn Student Ambassadors program.' },
          { time: '5:30 PM', title: 'Application Process & Milestones', description: 'Step-by-step roadmap from New to Alpha, Beta, and Gold ranks.' },
          { time: '6:30 PM', title: 'Q&A & Community Interactive Session', description: 'Open Q&A with Tisha and live guidance.' },
        ],
      },
    },
  });

  // Attach speaker Tisha to Event 1
  await prisma.eventSpeaker.create({
    data: {
      eventId: event1.id,
      speakerId: speakerTisha.id,
    },
  });

  // Create Registration Form for Event 1
  await prisma.registrationForm.create({
    data: {
      eventId: event1.id,
      formName: 'Student Ambassador Roadmap Registration',
      formType: FormType.COLLEGE_REGISTRATION,
      sections: {
        create: [
          {
            title: 'Student Personal Information',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Full Name', type: FieldType.SHORT_TEXT, required: true, displayOrder: 1 },
                { label: 'Marwadi University Email', type: FieldType.EMAIL, required: true, displayOrder: 2 },
                { label: 'Enrollment Number', type: FieldType.SHORT_TEXT, required: true, displayOrder: 3 },
                { label: 'Department / Branch', type: FieldType.SHORT_TEXT, required: true, displayOrder: 4 },
                { label: 'Current Semester / Year', type: FieldType.DROPDOWN, required: true, displayOrder: 5, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
              ],
            },
          },
        ],
      },
    },
  });

  // ── EVENT 2: Azure Learning + Competition (24 Aug 2026) ──────────────────
  const event2 = await prisma.event.create({
    data: {
      id: 'evt_azure_comp_aug24',
      title: 'Azure Learning + Competition',
      slug: 'azure-learning-competition',
      shortDescription: 'Hands-on Azure workshop covering static websites & Azure use cases, followed by a competition with goodies & prizes.',
      description: 'A small, practical technical session rather than a traditional lecture. Learn Azure basics, deploy static websites, and participate in a live practical activity. The session concludes with a competitive challenge where 3 top winners will be recognized and awarded exclusive goodies and prizes!',
      banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
      category: EventCategory.HACKATHON,
      mode: EventMode.OFFLINE,
      venue: 'Inner Seminar Hall, Main Campus',
      startDate: new Date('2026-08-24T10:00:00.000Z'), // 10:00 AM IST
      endDate: new Date('2026-08-24T16:00:00.000Z'),   // 4:00 PM IST
      registrationStart: new Date('2026-08-12T00:00:00.000Z'),
      registrationEnd: new Date('2026-08-24T09:00:00.000Z'),
      capacity: 150,
      remainingSeats: 150,
      eventStatus: EventStatus.PUBLISHED,
      status: 'published',
      agendaItems: {
        create: [
          { time: '10:00 AM', title: 'Learn Azure Concepts & Use Cases', description: 'Overview of Static Web Apps, Blob Storage, and serverless architecture.' },
          { time: '11:30 AM', title: 'Practical Lab: Deploy Static Website', description: 'Step-by-step hands-on website deployment on Azure.' },
          { time: '02:00 PM', title: 'Live Competition Sprint', description: 'Practical activity and solution building competition.' },
          { time: '03:30 PM', title: 'Winner Announcement & Goodies Distribution', description: 'Felicitation of top 3 winners with official prizes.' },
        ],
      },
    },
  });

  // Create Registration Form for Event 2
  await prisma.registrationForm.create({
    data: {
      eventId: event2.id,
      formName: 'Azure Learning + Competition Registration',
      formType: FormType.COLLEGE_REGISTRATION,
      sections: {
        create: [
          {
            title: 'Participant Details',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Full Name', type: FieldType.SHORT_TEXT, required: true, displayOrder: 1 },
                { label: 'Marwadi University Email', type: FieldType.EMAIL, required: true, displayOrder: 2 },
                { label: 'Enrollment Number', type: FieldType.SHORT_TEXT, required: true, displayOrder: 3 },
                { label: 'Department / Branch', type: FieldType.SHORT_TEXT, required: true, displayOrder: 4 },
                { label: 'Azure Experience', type: FieldType.DROPDOWN, required: false, displayOrder: 5, options: ['Beginner', 'Intermediate', 'Advanced'] },
              ],
            },
          },
        ],
      },
    },
  });

  // ── EVENT 3: September Event & Academic Planning (Om's Event) ────────────
  const event3 = await prisma.event.create({
    data: {
      id: 'evt_oms_sept',
      title: "Om's Event — Tech Workshop",
      slug: 'oms-event-tech-workshop',
      shortDescription: 'Final hands-on technical event ahead of mid-September academic pressure.',
      description: 'Om\'s Event is planned for the first week of September, timed ahead of rising mid-September academic pressure. This will be the final physical event before the community takes a short pause for exams, with learning continuing asynchronously via the official WhatsApp Community.',
      banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
      category: EventCategory.WORKSHOP,
      mode: EventMode.OFFLINE,
      venue: 'Seminar Hall 4, Main Campus',
      startDate: new Date('2026-09-03T10:00:00.000Z'), // 1st week of Sept (Sept 3)
      endDate: new Date('2026-09-03T16:00:00.000Z'),
      registrationStart: new Date('2026-08-12T00:00:00.000Z'),
      registrationEnd: new Date('2026-09-03T09:00:00.000Z'),
      capacity: 200,
      remainingSeats: 200,
      eventStatus: EventStatus.PUBLISHED,
      status: 'published',
      agendaItems: {
        create: [
          { time: '10:00 AM', title: 'Keynote & Project Review', description: 'Opening address by Om on developer tools and semester roadmaps.' },
          { time: '11:30 AM', title: 'Hands-on Technical Session', description: 'Live coding, GitHub workflows, and project building.' },
          { time: '02:30 PM', title: 'Academic Pause Transition & WhatsApp Learning Plan', description: 'Guide on self-paced learning modules during exam break.' },
        ],
      },
    },
  });

  // Attach speaker Om to Event 3
  await prisma.eventSpeaker.create({
    data: {
      eventId: event3.id,
      speakerId: speakerOm.id,
    },
  });

  // Create Registration Form for Event 3
  await prisma.registrationForm.create({
    data: {
      eventId: event3.id,
      formName: "Om's Tech Workshop Registration",
      formType: FormType.COLLEGE_REGISTRATION,
      sections: {
        create: [
          {
            title: 'Registration Details',
            displayOrder: 1,
            fields: {
              create: [
                { label: 'Full Name', type: FieldType.SHORT_TEXT, required: true, displayOrder: 1 },
                { label: 'Marwadi University Email', type: FieldType.EMAIL, required: true, displayOrder: 2 },
                { label: 'Enrollment Number', type: FieldType.SHORT_TEXT, required: true, displayOrder: 3 },
                { label: 'Department / Branch', type: FieldType.SHORT_TEXT, required: true, displayOrder: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('  ✓ Successfully seeded 3 authentic events with agendas, speakers, and registration forms.');

  // 5. Seed Core Recruitment Roles
  await prisma.recruitmentRole.createMany({
    data: [
      { title: 'Technical Lead', department: 'Computer Engineering / IT', description: 'Lead cloud architecture workshops, review student projects, and build open-source tools.', status: 'OPEN', displayOrder: 1 },
      { title: 'Event Manager', department: 'All Branches', description: 'Coordinate venue logistics, QR check-in scanning, and volunteer scheduling.', status: 'OPEN', displayOrder: 2 },
      { title: 'Media & Design Lead', department: 'Design / Engineering', description: 'Create event banners, video highlights, and Fluent 2 social media assets.', status: 'OPEN', displayOrder: 3 },
      { title: 'Content Writer', department: 'All Branches', description: 'Write technical blogs, newsletter editions, and event press releases.', status: 'CLOSED', displayOrder: 4 },
    ],
  });

  console.log('  ✓ Seeded recruitment leadership roles.');

  // 6. Seed Official Notices for the new events
  await prisma.notice.createMany({
    data: [
      {
        title: 'Registration Open: Student Ambassador Roadmap (17 Aug)',
        description: 'Join us online on Aug 17 (5:00-7:00 PM) on Teams as Tisha presents the official roadmap to becoming a Microsoft Learn Student Ambassador.',
        priority: NoticePriority.MICROSOFT_LEARN,
        isPinned: true,
        status: 'active',
      },
      {
        title: 'Upcoming: Azure Learning + Competition (24 Aug)',
        description: 'Hands-on practical session on static websites & Azure concepts at Inner Seminar Hall. 3 top winners will receive goodies and prizes!',
        priority: NoticePriority.EVENT,
        isPinned: true,
        status: 'active',
      },
    ],
  });

  console.log('  ✓ Seeded official event notices.');
  console.log('✅ Clean & Seed completed successfully!');
}

cleanAndSeed()
  .catch((e) => {
    console.error('❌ Clean & Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
