'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, Award, Users, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">About MCC (§21)</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Microsoft Campus Club (MCC)</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The official Microsoft Student Community at Marwadi University, Rajkot, dedicated to accelerating student learning in cloud computing, artificial intelligence, software engineering, and open source development.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4 border-sky-500/30">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To create an enterprise-grade tech ecosystem where every student at Marwadi University gains industry-relevant skills, builds real-world applications, earns Microsoft certifications, and emerges as a globally competitive software engineer.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border-purple-500/30">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Eliminate administrative barriers through automation, deliver high-quality hands-on bootcamps, foster a healthy competitive spirit via points and leaderboards, and build strong industry mentorship channels.
          </p>
        </Card>
      </div>

      {/* Core Pillars */}
      <div className="space-y-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">Core Pillars of Excellence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <BookOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Azure & Cloud Mastery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Regular workshops covering Azure Functions, Cosmos DB, Containers, Bicep, and DevOps.</p>
          </Card>

          <Card className="p-6 space-y-3">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Peer Mentorship</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Senior student leaders and Microsoft Ambassadors mentoring junior developers.</p>
          </Card>

          <Card className="p-6 space-y-3">
            <Award className="w-8 h-8 text-amber-500 dark:text-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gamified Growth</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Earn community points, unlock achievement badges, and climb the institutional leaderboard.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
