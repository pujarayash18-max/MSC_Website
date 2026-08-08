// Cosmos DB Containers & Partition Key Map (§88, ARCHITECTURE.md §4)

export interface ContainerDefinition {
  name: string;
  partitionKey: string;
  description: string;
}

export const COSMOS_CONTAINERS: Record<string, ContainerDefinition> = {
  Users: { name: 'Users', partitionKey: '/id', description: 'Student and Admin Profiles' },
  Roles: { name: 'Roles', partitionKey: '/id', description: 'RBAC System Roles' },
  Permissions: { name: 'Permissions', partitionKey: '/id', description: 'RBAC Module Permissions' },
  Events: { name: 'Events', partitionKey: '/id', description: 'Club Events Catalog' },
  RegistrationForms: { name: 'RegistrationForms', partitionKey: '/eventId', description: 'Dynamic Registration Form Definitions' },
  Registrations: { name: 'Registrations', partitionKey: '/eventId', description: 'Student Registrations for Events' },
  Teams: { name: 'Teams', partitionKey: '/eventId', description: 'Hackathon & Group Teams' },
  Attendance: { name: 'Attendance', partitionKey: '/eventId', description: 'Event QR Check-in Records' },
  Certificates: { name: 'Certificates', partitionKey: '/userId', description: 'Issued Participation & Winner Certificates' },
  CertificateTemplates: { name: 'CertificateTemplates', partitionKey: '/id', description: 'Certificate Design Templates' },
  Resources: { name: 'Resources', partitionKey: '/eventId', description: 'Event Resource Files & Live Streams' },
  Gallery: { name: 'Gallery', partitionKey: '/id', description: 'Photos & Videos' },
  Albums: { name: 'Albums', partitionKey: '/id', description: 'Gallery Albums' },
  Speakers: { name: 'Speakers', partitionKey: '/id', description: 'Guest Speakers Profiles' },
  TeamMembers: { name: 'TeamMembers', partitionKey: '/id', description: 'MCC Core Team & Faculty' },
  Blogs: { name: 'Blogs', partitionKey: '/id', description: 'Technical Articles & Drafts' },
  Categories: { name: 'Categories', partitionKey: '/id', description: 'Event & Content Categories' },
  Tags: { name: 'Tags', partitionKey: '/id', description: 'Content Tags' },
  Feedback: { name: 'Feedback', partitionKey: '/eventId', description: 'Event Ratings & Feedback' },
  Notices: { name: 'Notices', partitionKey: '/id', description: 'Announcements & Notice Board' },
  Sponsors: { name: 'Sponsors', partitionKey: '/id', description: 'Sponsor Logos & Partners' },
  Projects: { name: 'Projects', partitionKey: '/id', description: 'Community Student Projects' },
  Achievements: { name: 'Achievements', partitionKey: '/userId', description: 'Unlocked Student Badges' },
  Points: { name: 'Points', partitionKey: '/userId', description: 'Community Points Ledger' },
  Leaderboard: { name: 'Leaderboard', partitionKey: '/id', description: 'Rankings & Leaderboard Summaries' },
  WinnerAnnouncements: { name: 'WinnerAnnouncements', partitionKey: '/eventId', description: 'Event Competition Winners' },
  Notifications: { name: 'Notifications', partitionKey: '/userId', description: 'In-app Notifications' },
  ContactTickets: { name: 'ContactTickets', partitionKey: '/id', description: 'Support Tickets & Contact Submissions' },
  NewsletterSubscribers: { name: 'NewsletterSubscribers', partitionKey: '/id', description: 'Newsletter Subscriptions' },
  AuditLogs: { name: 'AuditLogs', partitionKey: '/id', description: 'System Audit Logs' },
  Settings: { name: 'Settings', partitionKey: '/id', description: 'Global System Settings' }
};
