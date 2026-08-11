'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Save, Lock, User, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';

export default function StudentSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        bio,
        github,
        linkedin,
        portfolio,
        skills: parsedSkills
      });
      toast.success('Profile settings updated successfully!');
    } catch {
      toast.error('Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#00A4EF]" /> Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
          Manage your personal details, portfolio links, and skills. Email & Enrollment number are read-only per security policy.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Read-Only Academic Info */}
        <Card className="p-6 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FFB900]" /> Read-Only Academic Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-[#A8B0BB] font-medium block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.fullName || ''}
                className="w-full p-2.5 bg-slate-100 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-[#A8B0BB] font-medium block mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-[#A8B0BB] font-medium block mb-1">Enrollment Number</label>
              <input
                type="text"
                disabled
                value={user?.enrollmentNumber || ''}
                className="w-full p-2.5 bg-slate-100 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-[#A8B0BB] font-medium block mb-1">College & Department</label>
              <input
                type="text"
                disabled
                value={`${user?.department} - ${user?.college}`}
                className="w-full p-2.5 bg-slate-100 dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Editable Profile Information */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00A4EF]" /> Public Profile Info
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Biography / About Me</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself, your interests, and tech background..."
              className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Azure, Python, Machine Learning"
              className="w-full p-3 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <GithubIcon className="w-3.5 h-3.5 text-[#00A4EF]" /> GitHub Username
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="username"
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <LinkedinIcon className="w-3.5 h-3.5 text-[#00A4EF]" /> LinkedIn Profile ID
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="username"
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#00A4EF]" /> Portfolio URL
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://mywebsite.dev"
                className="w-full p-2.5 text-xs bg-white dark:bg-[#0B0F14] border border-slate-200 dark:border-[#2A323D] rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A4EF] focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="fluent" size="lg" disabled={isSaving}>
            <Save className="w-4 h-4" /> Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
