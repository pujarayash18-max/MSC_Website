'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { INITIAL_TEAM } from '@/lib/services/dataService';
import { toast } from 'sonner';
import { Users, Plus, Edit3, Star } from 'lucide-react';

export default function AdminTeamPage() {
  const [team, setTeam] = useState(INITIAL_TEAM);

  const toggleFeatured = (id: string) => {
    setTeam((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFeaturedHomepage: !t.isFeaturedHomepage } : t))
    );
    toast.info('Homepage slider feature toggled.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#00A4EF]" /> Core Team & Lead Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B0BB] mt-1">
            Manage lead privileges, department assignments, and alumni roster.
          </p>
        </div>

        <Button variant="fluent" size="sm" onClick={() => toast.success('New team member invitation link generated!')}>
          <Plus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {team.map((m) => (
          <Card key={m.id} className="p-6 space-y-4 border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#151B23] text-center">
            <Image src={m.photo} alt={m.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-[#00A4EF]" />
            <div>
              <Badge variant="primary" size="sm" className="mb-1">{m.category}</Badge>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{m.name}</h3>
              <p className="text-xs text-[#0078D4] dark:text-[#00A4EF] font-semibold">{m.position}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#2A323D] flex items-center justify-between">
              <Button
                variant={m.isFeaturedHomepage ? 'fluent' : 'outline'}
                size="sm"
                onClick={() => toggleFeatured(m.id)}
                className="text-[11px] gap-1"
              >
                <Star className="w-3 h-3" /> {m.isFeaturedHomepage ? 'Featured' : 'Feature'}
              </Button>

              <Button variant="outline" size="sm" onClick={() => toast.info(`Editing ${m.name}`)}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
