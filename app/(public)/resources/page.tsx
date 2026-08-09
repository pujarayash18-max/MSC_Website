'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  FolderDown,
  Download,
  ExternalLink,
  Search,
  BookOpen,
  Code,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  LogIn,
  UserPlus,
  Ticket,
  CheckCircle2
} from 'lucide-react';
import { GithubIcon, MicrosoftFourSquareIcon } from '@/components/icons';

// Mock registered events for the current user session
const MOCK_USER_REGISTRATIONS = ['evt_01', 'evt_02']; // Registered for Azure Masterclass & AI Challenge
const MOCK_USER_CHECKINS = ['evt_01']; // Checked in for Azure Masterclass

const PUBLIC_RESOURCES = [
  {
    id: 'pub_res_1',
    eventId: 'evt_01',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Azure Functions v4 Node.js Starter Kit',
    description: 'Complete boilerplate featuring Azure Functions v4, TypeScript, Bicep deployment templates, and Cosmos DB bindings.',
    category: 'Source Code',
    tags: ['Azure Functions', 'TypeScript', 'Serverless', 'Bicep'],
    type: 'github',
    visibility: 'Checked-in Students Only',
    link: 'https://github.com/mcc-marwadi/azure-functions-starter',
    updatedAt: 'Aug 2026',
    featured: true
  },
  {
    id: 'pub_res_2',
    eventId: 'evt_01',
    eventTitle: 'Azure Cloud Architecture & Serverless Masterclass',
    title: 'Cosmos DB NoSQL Data Modeling Guide',
    description: 'Presentation slide deck covering partition key strategies, indexing policies, and transactional batching in Cosmos DB.',
    category: 'Presentation Slides',
    tags: ['Cosmos DB', 'NoSQL', 'Database Architecture'],
    type: 'download',
    visibility: 'Registered Students',
    link: 'https://mccdevstorage.blob.core.windows.net/resources/cosmos-slides.pdf',
    updatedAt: 'Aug 2026',
    featured: true
  },
  {
    id: 'pub_res_3',
    eventId: 'evt_03',
    eventTitle: 'Full-Stack Web Development Starter Bootcamp',
    title: 'Microsoft Azure Fundamentals (AZ-900) Study Roadmap',
    description: 'Comprehensive curriculum roadmap, key topic summaries, and practice quiz sets for clearing AZ-900 certification.',
    category: 'Workshops & Curricula',
    tags: ['AZ-900', 'Certification', 'Cloud Fundamentals'],
    type: 'external',
    visibility: 'Registered Students',
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    updatedAt: 'Jul 2026',
    featured: false
  },
  {
    id: 'pub_res_4',
    eventId: 'evt_02',
    eventTitle: 'AI Engineer Challenge: GitHub Copilot & OpenAI Workshop',
    title: 'AI Engineer Challenge: GitHub Copilot & OpenAI Workshop',
    description: 'Hands-on laboratory guide and code snippets for integrating Azure OpenAI GPT-4o into React web applications.',
    category: 'Source Code',
    tags: ['Azure OpenAI', 'GPT-4o', 'React', 'Copilot'],
    type: 'github',
    visibility: 'Registered Students',
    link: 'https://github.com/mcc-marwadi/azure-openai-react-demo',
    updatedAt: 'Jul 2026',
    featured: true
  },
  {
    id: 'pub_res_5',
    eventId: 'evt_general',
    eventTitle: 'General Community Resource',
    title: 'Full-Stack Web Development Starter Template (Next.js 15)',
    description: 'Standardized MCC starter template with Tailwind CSS, TypeScript, ESLint, and Microsoft Fluent UI design tokens.',
    category: 'Source Code',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Fluent UI'],
    type: 'github',
    visibility: 'Public',
    link: 'https://github.com/mcc-marwadi/nextjs-fluent-starter',
    updatedAt: 'Jun 2026',
    featured: false
  },
  {
    id: 'pub_res_6',
    eventId: 'evt_general',
    eventTitle: 'General Community Resource',
    title: 'Microsoft Learn Student Ambassadors Official Playbook',
    description: 'Guidelines, community paths, and activity guides for MLSA student advocates at Marwadi University.',
    category: 'Workshops & Curricula',
    tags: ['MLSA', 'Community', 'Leadership'],
    type: 'external',
    visibility: 'Public',
    link: 'https://mvp.microsoft.com/en-US/studentambassadors',
    updatedAt: 'May 2026',
    featured: false
  }
];

const CATEGORIES = ['All', 'Source Code', 'Presentation Slides', 'Workshops & Curricula'];

export default function PublicResourcesPage() {
  const { user, isAuthenticated, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredResources = PUBLIC_RESOURCES.filter((res) => {
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" className="gap-1.5 px-3 py-1 text-xs">
          <BookOpen className="w-3.5 h-3.5" /> Learning & Event Resources Library
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          MCC Shared <span className="text-[#0078D4] dark:text-[#00A4EF]">Resources</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-[#A8B0BB] leading-relaxed">
          Access open-source code repositories, slide decks, Azure workshop guides, and study materials shared for registered event members.
        </p>
      </div>

      {/* Auth Gate Banner / Prompt if not logged in */}
      {!isAuthenticated ? (
        <Card className="p-8 bg-gradient-to-r from-[#0078D4]/10 via-[#00A4EF]/15 to-purple-600/10 border-[#00A4EF]/40 dark:border-[#00A4EF]/30 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00A4EF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-[#0078D4] dark:bg-[#00A4EF] flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30">
            <Lock className="w-7 h-7" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <Badge variant="warning" className="gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Access Restricted to Registered Members
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Please Sign In to Access Event Resources
            </h2>
            <p className="text-sm text-slate-600 dark:text-[#A8B0BB] leading-relaxed">
              Sharing of event resources, Azure Functions starter kits, and workshop slides is restricted to signed-in students and registered event members.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/login?redirect=/resources">
              <Button variant="fluent" size="lg" className="gap-2 px-6 shadow-xl shadow-sky-500/25">
                <LogIn className="w-4 h-4" /> Sign In to Access Resources
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg" className="gap-2 px-6">
                <UserPlus className="w-4 h-4 text-[#00A4EF]" /> Register Account
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => login('aad')} className="gap-2 px-6">
              <MicrosoftFourSquareIcon className="w-4 h-4" /> Microsoft SSO
            </Button>
          </div>
        </Card>
      ) : (
        /* Authenticated Student Banner */
        <Card className="p-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-blue-500/10 border-[#00A4EF]/30 dark:border-[#00A4EF]/20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="gap-1 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Signed in as {user?.fullName || 'Student Member'}
                </Badge>
                <Badge variant="success" className="gap-1 text-xs">
                  <Zap className="w-3 h-3 text-emerald-400" /> Active Member Permissions
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Event Member Resource Center
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#A8B0BB] leading-relaxed">
                Resources are unlocked based on your event registrations and venue check-ins. You can also view live broadcasts in your Student Dashboard.
              </p>
            </div>

            <Link href={isAuthenticated ? '/dashboard/resources' : '/login?redirect=/dashboard/resources'} className="shrink-0">
              <Button variant="fluent" className="gap-2 shadow-lg shadow-sky-500/20">
                <FolderDown className="w-4 h-4" /> Go to Student Resources
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Search & Category Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0078D4] dark:bg-[#00A4EF] text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-[#151B23] text-slate-700 dark:text-[#A8B0BB] hover:bg-slate-200 dark:hover:bg-[#1B222C] border border-slate-200 dark:border-[#2A323D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00A4EF] transition-colors"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          // Check access permissions
          const isRegistered = res.eventId === 'evt_general' || MOCK_USER_REGISTRATIONS.includes(res.eventId);
          const isCheckedIn = res.eventId === 'evt_general' || MOCK_USER_CHECKINS.includes(res.eventId);

          let hasPermission = false;
          if (isAuthenticated) {
            if (res.visibility === 'Public') hasPermission = true;
            else if (res.visibility === 'Registered Students' && isRegistered) hasPermission = true;
            else if (res.visibility === 'Checked-in Students Only' && isCheckedIn) hasPermission = true;
          }

          return (
            <Card
              key={res.id}
              className={`p-6 border-slate-200 dark:border-[#2A323D] flex flex-col justify-between space-y-5 transition-all group ${
                hasPermission
                  ? 'hover:border-[#00A4EF]/50 hover:shadow-lg dark:hover:shadow-sky-500/5'
                  : 'opacity-85 bg-slate-50/50 dark:bg-[#151B23]/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary" size="sm" className="gap-1">
                    {res.category === 'Source Code' && <Code className="w-3 h-3" />}
                    {res.category === 'Presentation Slides' && <FileText className="w-3 h-3" />}
                    {res.category === 'Workshops & Curricula' && <BookOpen className="w-3 h-3" />}
                    {res.category}
                  </Badge>

                  {/* Access Control Badge */}
                  {res.visibility === 'Registered Students' && (
                    <Badge variant={isRegistered ? 'success' : 'purple'} size="sm" className="gap-1">
                      <Ticket className="w-3 h-3" /> {isRegistered ? 'Registered Member Access' : 'Registered Members Only'}
                    </Badge>
                  )}
                  {res.visibility === 'Checked-in Students Only' && (
                    <Badge variant={isCheckedIn ? 'success' : 'purple'} size="sm" className="gap-1">
                      <Lock className="w-3 h-3" /> {isCheckedIn ? 'Checked-In Access' : 'Checked-in Students Only'}
                    </Badge>
                  )}
                  {res.visibility === 'Public' && (
                    <Badge variant="outline" size="sm" className="gap-1">
                      <Globe className="w-3 h-3" /> All Signed-in Users
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#0078D4] dark:group-hover:text-[#00A4EF] transition-colors leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {res.eventTitle}
                </p>

                <p className="text-xs text-slate-600 dark:text-[#A8B0BB] leading-relaxed line-clamp-3">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-[#1B222C] text-slate-600 dark:text-[#A8B0BB] border border-slate-200/60 dark:border-[#2A323D]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Updated {res.updatedAt}</span>

                {!isAuthenticated ? (
                  <Link href="/login?redirect=/resources">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#0078D4] dark:text-[#00A4EF] border-[#00A4EF]/30">
                      <Lock className="w-3.5 h-3.5" /> Sign In to Access
                    </Button>
                  </Link>
                ) : hasPermission ? (
                  <a href={res.link} target="_blank" rel="noreferrer">
                    {res.type === 'github' && (
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <GithubIcon className="w-3.5 h-3.5" /> Repository
                      </Button>
                    )}
                    {res.type === 'download' && (
                      <Button variant="fluent" size="sm" className="gap-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </Button>
                    )}
                    {res.type === 'external' && (
                      <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                        <Globe className="w-3.5 h-3.5" /> Learn More <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </a>
                ) : !isRegistered ? (
                  <Link href="/events">
                    <Button variant="secondary" size="sm" className="gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <Ticket className="w-3.5 h-3.5" /> Register for Event
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs">
                    <Lock className="w-3 h-3" /> Venue Check-in Required
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
