# Microsoft Campus Club (MCC) Management Platform

Official Digital Ecosystem for Microsoft Campus Club (MCC) at Marwadi University, Rajkot.

## Architecture Highlights
- **Frontend**: Next.js 14+ (App Router), TypeScript (Strict Mode), Tailwind CSS with Microsoft Fluent 2 inspired design tokens, Framer Motion, TanStack Query v5, Recharts, TanStack Table, Sonner.
- **Backend**: Azure Functions v4 programming model in Node.js/TypeScript.
- **Database**: Azure Cosmos DB (NoSQL) with 33 collections and per-collection partition keys.
- **File Storage**: Azure Blob Storage with SAS token security.
- **Real-Time**: Azure SignalR Service / WebSockets for live counters and resource broadcasts.
- **Authentication & RBAC**: Azure Static Web Apps Client Principal Auth + server-side RBAC permission matrix enforcement.

## Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Development Server
Run Next.js dev server:
```bash
npm run dev
```

### 3. Build & Type Check
Verify TypeScript strict mode and production bundle:
```bash
npx tsc --noEmit
npm run build
```

## Functional Modules
1. **Public Website**: Homepage, About, Team, Speakers, Events, Projects, Blog, Gallery, Leaderboard, Join Us, Contact, Global Search.
2. **Student Dashboard**: Events, Registrations, QR Pass Generator, Attendance History, Live Event Resources, Certificates, Community Points, Badges, Leaderboard, Settings.
3. **Admin Console**: Visual Form Builder, Event Lifecycle Manager, QR Attendance Scanner, Winner Publish Cascade, Live Resource Uploader, Certificate Generator, RBAC Matrix Manager, Audit Logs, Reports & Analytics.
