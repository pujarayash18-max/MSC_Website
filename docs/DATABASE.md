# MCC Management Platform — Cosmos DB Schema & Containers

Cosmos DB Data Model specification for Microsoft Campus Club (MCC) Platform at Marwadi University.

## Database Name
`mcc-db`

## Container Topology & Partition Keys (§7)

| Container Name | Partition Key | Description |
| :--- | :--- | :--- |
| **Users** | `/id` | Student profiles, admin roles, and credentials hashes |
| **Roles** | `/id` | System RBAC Roles (Super Admin, Website Admin, etc.) |
| **Events** | `/id` | Event catalog metadata, dates, agendas, capacities |
| **RegistrationForms** | `/eventId` | Dynamic form builder definitions |
| **Registrations** | `/eventId` | Student registrations, waitlist status, and QR tokens |
| **Attendance** | `/eventId` | QR scan check-in records with entry timestamps |
| **Certificates** | `/userId` | Issued student certificates and verification IDs |
| **CertificateTemplates** | `/id` | Canvas PDF template layouts & placeholder coordinates |
| **Resources** | `/eventId` | Event slides, code samples, and recording URLs |
| **Feedback** | `/eventId` | Verified student ratings and suggestions |
| **Notices** | `/id` | Announcement notice board entries |
| **Points** | `/userId` | Community points ledger and transaction history |
| **Achievements** | `/userId` | Unlocked student badges |
| **Leaderboard** | `/id` | Community rank summaries |
| **AuditLogs** | `/id` | System administrative security logs |

---

## Sample Document Structure

### Users Container Document
```json
{
  "id": "usr_1723145600",
  "userId": "usr_1723145600",
  "studentId": "MCC-2026-00042",
  "fullName": "Rahul Sharma",
  "email": "student@marwadiuniversity.ac.in",
  "enrollmentNumber": "92100103045",
  "college": "Marwadi University",
  "department": "Computer Engineering",
  "year": "3rd Year",
  "division": "A",
  "communityPoints": 340,
  "currentRank": 1,
  "attendancePercentage": 95,
  "roleId": "role_student",
  "roleName": "Student",
  "status": "active",
  "createdAt": "2026-08-08T20:00:00.000Z"
}
```
