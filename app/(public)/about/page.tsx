'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Target,
  Compass,
  Globe,
  Users,
  Award,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  BookOpen,
  Rocket,
  Hammer,
  ShieldCheck,
  HelpCircle,
  Share2
} from 'lucide-react';

const VISION_ITEMS = [
  {
    title: 'A Starting Point for Every Student',
    description: 'Every student should have a place to begin, regardless of their current knowledge or experience.',
    icon: Compass,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/30'
  },
  {
    title: 'A Bridge to the Real World',
    description: 'Students should be able to connect what they learn in classrooms with practical applications and industry expectations.',
    icon: Globe,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30'
  },
  {
    title: 'A Community Where Everyone Learns Together',
    description: 'MSC should be a student-led community where no one is expected to know everything. Students learn, explore, experiment and figure things out together.',
    icon: Users,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    title: 'A Community That Develops Student Leaders',
    description: 'Students should not only participate but also take ownership, lead, create and contribute to the community.',
    icon: Award,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30'
  },
  {
    title: 'A Support System Throughout the Journey',
    description: 'Students should always have people, resources and opportunities to turn to when they are stuck or looking for their next step.',
    icon: HeartHandshake,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/30'
  },
  {
    title: 'A Cycle of Growth and Contribution',
    description: 'Students who grow through the community should become the ones who guide, support and create opportunities for the students who come after them.',
    icon: TrendingUp,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30'
  }
];

const MISSION_ITEMS = [
  {
    condition: "When a student doesn't know where to start",
    action: 'Provide direction, resources and opportunities to help them take their first step.',
    icon: Sparkles,
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  },
  {
    condition: 'When a student wants to learn',
    action: 'Create opportunities through workshops, expert sessions, hands-on activities and peer-to-peer learning around Microsoft and emerging technologies.',
    icon: BookOpen,
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    condition: 'When a student wants to explore',
    action: 'Encourage students to explore technologies, ideas, projects, people, industry exposure and career possibilities together.',
    icon: Rocket,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  {
    condition: 'When a student wants to build',
    action: 'Encourage students to apply what they learn by creating projects, solutions and practical experiences.',
    icon: Hammer,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  {
    condition: 'When a student wants to take responsibility',
    action: 'Give students opportunities to take ownership, lead teams, organize initiatives, manage projects and make decisions.',
    icon: ShieldCheck,
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    condition: 'When a student gets stuck',
    action: 'Help them find their next step through peers, experienced students, resources, guidance and opportunities.',
    icon: HelpCircle,
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  {
    condition: 'When a student grows',
    action: 'Encourage them to share what they have learned, showcase their work, support their peers and contribute back to the community.',
    icon: Share2,
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
  }
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">About MSC / MCC</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Microsoft Student Community (MSC)
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          The official Microsoft Student Community at Marwadi University, Rajkot — empowering students through practical hands-on learning, collaborative projects, leadership development, and real-world technology exposure.
        </p>
      </div>

      {/* Vision Section */}
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/10">
            <Eye className="w-7 h-7" />
          </div>
          <Badge variant="outline" className="text-sky-400 border-sky-500/30">Our Purpose & Aspiration</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            A guiding blueprint for how our community creates long-term impact for every student on campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VISION_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={idx}
                className="p-6 space-y-4 border-slate-200 dark:border-slate-800 hover:border-sky-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mission Section */}
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/10">
            <Target className="w-7 h-7" />
          </div>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">Actionable Commitments</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            How we actively support, guide, and empower students at every stage of their academic and professional journey.
          </p>
        </div>

        <div className="space-y-4">
          {MISSION_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={idx}
                className="p-6 border-slate-200 dark:border-slate-800 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.condition}
                    </span>
                  </div>
                  <div className="sm:border-l border-slate-200 dark:border-slate-800 sm:pl-4">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                      {item.action}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
