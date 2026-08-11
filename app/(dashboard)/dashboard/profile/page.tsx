'use client';

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, BookOpen, Globe, Trophy, Award, QrCode } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';

export default function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#2A323D] overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <Image
            src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={user?.fullName || 'Profile Photo'}
            width={96}
            height={96}
            unoptimized
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#00A4EF] shadow-xl"
          />
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.fullName}</h1>
              <Badge variant="primary" className="font-bold">{user?.roleName}</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-[#A8B0BB] flex items-center justify-center md:justify-start gap-2">
              <span>{user?.department}</span> • <span>{user?.year}</span> • <span>{user?.college}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 dark:text-[#A8B0BB] pt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#00A4EF]" /> {user?.email}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-[#00A4EF]" /> Enroll: {user?.enrollmentNumber}</span>
            </div>
          </div>

          <Link href="/dashboard/settings">
            <Button variant="fluent" size="sm">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <Trophy className="w-8 h-8 text-[#FFB900] mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB] uppercase font-semibold">Community Points</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.communityPoints} pts</h3>
          <p className="text-xs text-[#7FBA00] mt-1 font-medium">Rank #{user?.currentRank} Overall</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <QrCode className="w-8 h-8 text-[#00A4EF] mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB] uppercase font-semibold">Attendance Rate</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.attendancePercentage}%</h3>
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB] mt-1">Verified via QR Check-in</p>
        </Card>

        <Card className="p-6 text-center border-slate-200 dark:border-[#2A323D]">
          <Award className="w-8 h-8 text-[#7FBA00] mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-[#A8B0BB] uppercase font-semibold">Certificates Earned</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">4 Certificates</h3>
          <p className="text-xs text-[#7FBA00] mt-1 font-medium">Verified & Downloadable</p>
        </Card>
      </div>

      {/* Details & Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">About Student</h3>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] leading-relaxed">{user?.bio || 'No biography provided yet.'}</p>

          <h4 className="text-sm font-semibold text-slate-900 dark:text-white pt-2">Skills & Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.map((skill) => (
              <Badge key={skill} variant="primary" size="md">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2A323D] pb-3">Social & Links</h3>
          <div className="space-y-3 text-xs">
            {user?.github && (
              <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-[#A8B0BB] hover:text-[#00A4EF] transition-colors">
                <GithubIcon className="w-4 h-4 text-[#00A4EF]" /> github.com/{user.github}
              </a>
            )}
            {user?.linkedin && (
              <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-[#A8B0BB] hover:text-[#00A4EF] transition-colors">
                <LinkedinIcon className="w-4 h-4 text-[#00A4EF]" /> linkedin.com/in/{user.linkedin}
              </a>
            )}
            {user?.portfolio && (
              <a href={user.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 dark:text-[#A8B0BB] hover:text-[#00A4EF] transition-colors">
                <Globe className="w-4 h-4 text-[#00A4EF]" /> {user.portfolio}
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
