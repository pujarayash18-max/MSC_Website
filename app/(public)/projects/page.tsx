'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Trophy, Users } from 'lucide-react';
import { GithubIcon } from '@/components/icons';

const PROJECTS = [
  {
    projectId: 'prj_01',
    title: 'Azure Health AI Assistant',
    description: 'An AI-powered patient triage and diagnostic suggestion system built using Azure OpenAI GPT-4o and Cosmos DB.',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    technologies: ['Next.js', 'TypeScript', 'Azure OpenAI', 'Cosmos DB', 'Tailwind CSS'],
    githubRepository: 'https://github.com/rahulsharma-mu/azure-health-ai',
    liveDemo: 'https://azure-health-ai.vercel.app',
    teamMembers: ['Rahul Sharma', 'Ananya Verma', 'Vikram Singh'],
    awards: ['1st Place - National Azure AI Hackathon 2026']
  },
  {
    projectId: 'prj_02',
    title: 'Smart Campus Attendance Scanner',
    description: 'PWA camera scanner for instant student verification with offline sync and SignalR real-time counters.',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    technologies: ['React', 'TypeScript', 'html5-qrcode', 'Azure Functions'],
    githubRepository: 'https://github.com/mcc-marwadi/qr-attendance-pwa',
    teamMembers: ['Neha Patel', 'Karan Shah'],
    awards: ['Best Technical Innovation 2025']
  }
];

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary">Community Innovation (§27)</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Student Project Showcase</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Explore open source software, AI applications, and cloud projects built by MCC student members.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PROJECTS.map((prj) => (
          <Card key={prj.projectId} className="overflow-hidden border-slate-200 dark:border-slate-800 flex flex-col group hover:border-sky-500/50 transition-all">
            <img src={prj.thumbnail} alt={prj.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {prj.awards && (
                  <Badge variant="warning" className="gap-1 font-bold">
                    <Trophy className="w-3.5 h-3.5" /> {prj.awards[0]}
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{prj.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{prj.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prj.technologies.map((tech) => (
                    <Badge key={tech} variant="primary" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {prj.teamMembers.join(', ')}
                </span>

                <div className="flex items-center gap-2">
                  {prj.githubRepository && (
                    <a href={prj.githubRepository} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <GithubIcon className="w-4 h-4" /> Code
                      </Button>
                    </a>
                  )}
                  {prj.liveDemo && (
                    <a href={prj.liveDemo} target="_blank" rel="noreferrer">
                      <Button variant="fluent" size="sm">
                        <Globe className="w-4 h-4" /> Demo
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
