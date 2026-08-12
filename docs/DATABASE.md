# MSC Management Platform — Prisma & PostgreSQL Architecture

Relational Database schema specification for Microsoft Campus Club (MCC) Platform at Marwadi University, built on **Neon PostgreSQL** and **Prisma ORM**.

## Database Engine
- **Provider**: PostgreSQL (`postgresql://`)
- **Host**: Neon Serverless Postgres (`ep-steep-pond-aynabyxu`)
- **ORM**: Prisma (`@prisma/client`)

## Core Schema Models (32 Entities)

| Model Category | Entity Name | Description | Key Relations |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | `Role` | System roles (Super Admin, Website Admin, Event Manager, Student, etc.) | `users` |
| | `User` | Student & administrator profiles, password hashes, points, rank | `role`, `registrations`, `certificates`, `attendances`, `pointsLedger` |
| **Events & Forms** | `Event` | Workshops, hackathons, webcasts metadata, dates, capacity | `speakers`, `sponsors`, `agendaItems`, `registrations`, `resources` |
| | `Speaker` | Guest speaker profiles & topics | `eventSpeakers` |
| | `Sponsor` | Corporate & institutional partner tiers | `eventSponsors` |
| | `AgendaItem` | Event schedule timeline entries | `event` |
| | `RegistrationForm` | Dynamic custom form definitions per event | `event`, `sections` |
| | `FormSection` | Grouping sections within dynamic forms | `form`, `fields` |
| | `FormField` | Inputs (Text, Select, Checkbox, File) | `section` |
| **Registrations & Attendance** | `Registration` | Student event registrations & unique `qrToken` | `event`, `user`, `attendance`, `teamMembers` |
| | `RegistrationTeamMember` | Hackathon team member rosters | `registration` |
| | `Attendance` | Verified QR check-ins with `checkInTime` and `verifiedBy` | `registration`, `event`, `user` |
| **Certificates & Verification** | `CertificateTemplate` | PDF template layouts & placeholder coordinates | `certificates` |
| | `Certificate` | Issued certificates with `verificationCode`, `blobUrl`, `qrCodeUrl` | `user`, `event`, `template` |
| **Content & Engagement** | `Resource` | Slide decks, repositories, curriculum attachments | `event` |
| | `BlogPost` | Articles with draft / pending / published lifecycle | `author` |
| | `GalleryAlbum` | Event photo albums & cover images | `images` |
| | `GalleryImage` | Event images | `album` |
| | `Notice` | Notice board announcements & priority levels | — |
| | `Feedback` | Event ratings & student suggestions | `event`, `user` |
| | `PointsLedger` | Community points transaction audit | `user` |
| | `Achievement` | Unlocked student badges & rewards | `user` |
| | `WinnerShowcase` | Event winners & podium ranks | `event`, `user` |
| | `ContactTicket` | Inbound contact inquiry tickets | — |
| | `Notification` | Per-user notifications & read status | `user` |
| | `AuditLog` | Administrative action security logs | `user` |
| | `Settings` | System-wide configuration singleton | — |

---

## Key Indexes & Constraints
- `User.email` (unique, lowercase)
- `User.studentId` (unique, indexed)
- `Registration.qrToken` (unique, indexed)
- `Certificate.verificationCode` (unique, indexed)
- Soft delete pattern: `isDeleted Boolean @default(false)` across operational entities.
